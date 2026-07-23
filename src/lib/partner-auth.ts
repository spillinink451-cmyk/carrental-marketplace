import { auth } from "@/auth";
import { db } from "@/db";
import { companyUsers, companies, cars, bookings, branches, carCategories, carModels, carBrands, countries } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/encryption";

export type PartnerContext = {
  companyId: string;
  companyName: string;
  companyStatus: string;
  role: "owner" | "branch_admin" | "staff";
  branchId: string | null; // null only for owner
};

export async function requirePartnerCompany(): Promise<PartnerContext> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/partner");

  const [row] = await db
    .select({
      companyId: companyUsers.companyId,
      role: companyUsers.role,
      branchId: companyUsers.branchId,
      companyName: companies.name,
      companyStatus: companies.status,
    })
    .from(companyUsers)
    .innerJoin(companies, eq(companyUsers.companyId, companies.id))
    .where(eq(companyUsers.userId, session.user.id));

  if (!row) redirect("/");
  return row as PartnerContext;
}

export async function requireCompanyOwner(): Promise<PartnerContext> {
  const ctx = await requirePartnerCompany();
  if (ctx.role !== "owner") redirect("/partner");
  return ctx;
}

// Owner (any branch of their own company) OR branch_admin/staff of this specific branch
export async function requireBranchAccess(branchId: string): Promise<PartnerContext> {
  const ctx = await requirePartnerCompany();
  if (ctx.role === "owner") {
    const [branch] = await db
      .select()
      .from(branches)
      .where(and(eq(branches.id, branchId), eq(branches.companyId, ctx.companyId)));
    if (!branch) redirect("/partner");
    return ctx;
  }
  if (ctx.branchId !== branchId) redirect("/partner");
  return ctx;
}

// Owner, or branch_admin of this branch — staff cannot manage other staff
export async function requireBranchAdminAccess(branchId: string): Promise<PartnerContext> {
  const ctx = await requireBranchAccess(branchId);
  if (ctx.role === "staff") redirect("/partner");
  return ctx;
}

export async function requireCarForCompany(carId: string) {
  const ctx = await requirePartnerCompany();
  const [car] = await db
    .select({ id: cars.id, companyId: cars.companyId, branchId: cars.branchId, brand: carBrands.name, model: carModels.name, category: carCategories.name, pricePerDay: cars.pricePerDay, depositPercentage: cars.depositPercentage })
    .from(cars)
    .innerJoin(carBrands, eq(cars.brandId, carBrands.id))
    .innerJoin(carModels, eq(cars.modelId, carModels.id))
    .innerJoin(carCategories, eq(cars.categoryId, carCategories.id))
    .where(and(eq(cars.id, carId), eq(cars.companyId, ctx.companyId)));
  if (!car) throw new Error("Car not found for this company");
  if (ctx.role !== "owner" && car.branchId !== ctx.branchId) throw new Error("Not authorized for this car's branch");
  return car;
}

export async function requireBookingForCompany(bookingId: string) {
  const ctx = await requirePartnerCompany();
  const [row] = await db
    .select({ booking: bookings, idDocumentLabel: countries.idDocumentLabel })
    .from(bookings)
    .innerJoin(companies, eq(bookings.companyId, companies.id))
    .innerJoin(countries, eq(companies.country, countries.code))
    .where(and(eq(bookings.id, bookingId), eq(bookings.companyId, ctx.companyId)));
  if (!row) throw new Error("Booking not found for this company");
  const booking = row.booking;
  if (ctx.role !== "owner" && booking.pickupBranchId !== ctx.branchId) throw new Error("Not authorized for this booking's branch");
  return { ...booking, driverCnic: decrypt(booking.driverCnic), idDocumentLabel: row.idDocumentLabel };
}