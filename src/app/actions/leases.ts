"use server";

import { db } from "@/db";
import { leaseAgreements, leaseTemplates, bookings, cars, carBrands, carModels, companies, users } from "@/db/schema";
import { auth } from "@/auth";
import { eq, desc } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/encryption";
import { requireBranchAccess } from "@/lib/partner-auth";
import { uploadLeaseDocument } from "@/lib/r2";
import { generateLeasePDF } from "@/lib/lease-pdf";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { getSignatureReadUrl } from "@/lib/r2";

const DEFAULT_TERMS =
  "The lessee agrees to return the vehicle in the condition it was received, subject to normal wear and tear. " +
  "Any damage beyond normal wear will be assessed against the security deposit. The lessee is responsible for all " +
  "traffic violations incurred during the lease period. The lessor reserves the right to inspect the vehicle at pickup and return.";

async function getDefaultTemplate(companyId: string) {
  const [template] = await db.select().from(leaseTemplates).where(eq(leaseTemplates.companyId, companyId)).orderBy(desc(leaseTemplates.createdAt)).limit(1);
  return template ?? null;
}

// Called internally from approveBooking — Flow 1, not a form-facing action.
export async function createLeaseFromBooking(bookingId: string) {
  const [existing] = await db.select().from(leaseAgreements).where(eq(leaseAgreements.bookingId, bookingId));
  if (existing) return existing; // idempotent — never double-create if approval logic runs twice

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
  if (!booking) throw new Error("Booking not found");

  const [car] = await db
    .select({ id: cars.id, branchId: cars.branchId, pricePerDay: cars.pricePerDay, brand: carBrands.name, model: carModels.name })
    .from(cars)
    .innerJoin(carBrands, eq(cars.brandId, carBrands.id))
    .innerJoin(carModels, eq(cars.modelId, carModels.id))
    .where(eq(cars.id, booking.carId));
  if (!car) throw new Error("Car not found");

  const [company] = await db.select().from(companies).where(eq(companies.id, booking.companyId));
  const [lessee] = await db.select().from(users).where(eq(users.id, booking.userId));
  const template = await getDefaultTemplate(booking.companyId);
  const totalAmount = (Number(booking.depositAmount) + Number(booking.remainingAmount)).toFixed(2);

  const [lease] = await db.insert(leaseAgreements).values({
    bookingId: booking.id, companyId: booking.companyId, carId: car.id, branchId: car.branchId,
    templateId: template?.id, lesseeUserId: booking.userId,
    lesseeName: booking.driverName, lesseePhone: booking.driverPhone,
    lesseeCnicEncrypted: booking.driverCnic, // already encrypted with the same key — copy directly, no decrypt/re-encrypt
    lesseeEmail: lessee?.email,
    carSnapshot: `${car.brand} ${car.model}`, companyNameSnapshot: company?.name ?? "",
    startDate: booking.pickupAt, endDate: booking.dropoffAt,
    pricePerDay: car.pricePerDay, totalAmount, depositAmount: booking.depositAmount,
    mileageLimitKm: template?.mileageLimitKm, fuelPolicy: template?.fuelPolicy ?? "Return with the same fuel level as at pickup.",
    lateFeePerDay: template?.lateFeePerDay, termsAndConditions: template?.termsAndConditions ?? DEFAULT_TERMS,
    createdByUserId: booking.userId, status: "draft",
  }).returning();

  return lease;
}

// Flow 2 — standalone, no booking required.
export async function createStandaloneLease(input: {
  carId: string; lesseeName: string; lesseePhone: string; lesseeCnic: string; lesseeEmail?: string;
  startDate: string; endDate: string; pricePerDay: string; totalAmount: string; depositAmount: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const [car] = await db
    .select({ id: cars.id, companyId: cars.companyId, branchId: cars.branchId, brand: carBrands.name, model: carModels.name })
    .from(cars)
    .innerJoin(carBrands, eq(cars.brandId, carBrands.id))
    .innerJoin(carModels, eq(cars.modelId, carModels.id))
    .where(eq(cars.id, input.carId));
  if (!car) return { error: "Car not found." };

  await requireBranchAccess(car.branchId);

  if (!input.lesseeName?.trim() || !input.lesseePhone?.trim() || !input.lesseeCnic?.trim()) {
    return { error: "Lessee name, phone, and ID number are required." };
  }

  const [company] = await db.select().from(companies).where(eq(companies.id, car.companyId));
  const template = await getDefaultTemplate(car.companyId);

  // Link a real account if the email matches one — otherwise it's a true walk-in.
  let lesseeUserId: string | null = null;
  if (input.lesseeEmail?.trim()) {
    const [matched] = await db.select().from(users).where(eq(users.email, input.lesseeEmail.trim()));
    if (matched) lesseeUserId = matched.id;
  }

  const [lease] = await db.insert(leaseAgreements).values({
    bookingId: null, companyId: car.companyId, carId: car.id, branchId: car.branchId,
    templateId: template?.id, lesseeUserId,
    lesseeName: input.lesseeName.trim(), lesseePhone: input.lesseePhone.trim(),
    lesseeCnicEncrypted: encrypt(input.lesseeCnic.trim()), lesseeEmail: input.lesseeEmail?.trim(),
    carSnapshot: `${car.brand} ${car.model}`, companyNameSnapshot: company?.name ?? "",
    startDate: new Date(input.startDate), endDate: new Date(input.endDate),
    pricePerDay: input.pricePerDay, totalAmount: input.totalAmount, depositAmount: input.depositAmount,
    mileageLimitKm: template?.mileageLimitKm, fuelPolicy: template?.fuelPolicy ?? "Return with the same fuel level as at pickup.",
    lateFeePerDay: template?.lateFeePerDay, termsAndConditions: template?.termsAndConditions ?? DEFAULT_TERMS,
    createdByUserId: session.user.id, status: "draft",
  }).returning();

  redirect(`/partner/leases/${lease.id}`);
}

async function finalizeIfFullySigned(leaseId: string) {
  const [lease] = await db.select().from(leaseAgreements).where(eq(leaseAgreements.id, leaseId));
  if (!lease || !lease.customerSignatureUrl || !lease.companySignatureUrl) return;

  const pdfBuffer = await generateLeasePDF({
    companyNameSnapshot: lease.companyNameSnapshot, carSnapshot: lease.carSnapshot,
    lesseeName: lease.lesseeName, lesseePhone: lease.lesseePhone, lesseeCnic: decrypt(lease.lesseeCnicEncrypted),
    startDate: lease.startDate, endDate: lease.endDate,
    pricePerDay: lease.pricePerDay, totalAmount: lease.totalAmount, depositAmount: lease.depositAmount,
    mileageLimitKm: lease.mileageLimitKm, fuelPolicy: lease.fuelPolicy, lateFeePerDay: lease.lateFeePerDay,
    termsAndConditions: lease.termsAndConditions,
    customerSignatureUrl: lease.customerSignatureUrl, customerSignedAt: lease.customerSignedAt!,
    companySignatureUrl: lease.companySignatureUrl, companySignedAt: lease.companySignedAt!,
  });

  const pdfKey = await uploadLeaseDocument(`${lease.id}.pdf`, pdfBuffer, "application/pdf");
  await db.update(leaseAgreements).set({ status: "active", pdfUrl: pdfKey }).where(eq(leaseAgreements.id, leaseId));
}

export async function signLeaseAsCustomer(leaseId: string, signatureUrl: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const [lease] = await db.select().from(leaseAgreements).where(eq(leaseAgreements.id, leaseId));
  if (!lease) return { error: "Lease not found." };
  if (lease.lesseeUserId !== session.user.id) return { error: "This lease isn't linked to your account." };
  if (lease.customerSignatureUrl) return { error: "Already signed." };

  await db.update(leaseAgreements).set({ customerSignatureUrl: signatureUrl, customerSignedAt: new Date() }).where(eq(leaseAgreements.id, leaseId));
  await finalizeIfFullySigned(leaseId);
  revalidatePath(`/leases/${leaseId}`);
  return { success: true };
}

// Staff captures the signature in person for a walk-in with no platform account.
export async function captureWalkInCustomerSignature(leaseId: string, signatureUrl: string) {
  const [lease] = await db.select().from(leaseAgreements).where(eq(leaseAgreements.id, leaseId));
  if (!lease) return { error: "Lease not found." };
  if (lease.lesseeUserId) return { error: "This lessee has an account — they must sign from their own login." };
  await requireBranchAccess(lease.branchId);
  if (lease.customerSignatureUrl) return { error: "Already signed." };

  await db.update(leaseAgreements).set({ customerSignatureUrl: signatureUrl, customerSignedAt: new Date() }).where(eq(leaseAgreements.id, leaseId));
  await finalizeIfFullySigned(leaseId);
  revalidatePath(`/partner/leases/${leaseId}`);
  return { success: true };
}

export async function signLeaseAsCompany(leaseId: string, signatureUrl: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const [lease] = await db.select().from(leaseAgreements).where(eq(leaseAgreements.id, leaseId));
  if (!lease) return { error: "Lease not found." };
  await requireBranchAccess(lease.branchId);
  if (lease.companySignatureUrl) return { error: "Already signed." };

  await db.update(leaseAgreements).set({ companySignatureUrl: signatureUrl, companySignedAt: new Date(), companySignedByUserId: session.user.id }).where(eq(leaseAgreements.id, leaseId));
  await finalizeIfFullySigned(leaseId);
  revalidatePath(`/partner/leases/${leaseId}`);
  return { success: true };
}