"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { bookings, cars, companies, blockedDates, users } from "@/db/schema";
import { and, eq, lt, gt, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PLATFORM_FEE } from "@/lib/constants";
import { encrypt } from "@/lib/encryption";

export async function createBooking(input: {
  carId: string;
  pickupAt: string;
  dropoffAt: string;
  driverName: string;
  driverPhone: string;
  driverCnic: string;
  driverNationality: string;
  driverAddress: string;
  driverWorkAddress: string;
  driverWorkPhone: string;
  driverLicenseType: string;
  driverLicenseNo: string;
  driverLicenseIssueDate: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to book." };
  }

  if (
!   !input.driverName?.trim() || !input.driverPhone?.trim() || !input.driverCnic?.trim() ||
    !input.driverNationality?.trim() || !input.driverAddress?.trim() ||
    !input.driverWorkAddress?.trim() || !input.driverWorkPhone?.trim() ||
    !input.driverLicenseType?.trim() || !input.driverLicenseNo?.trim() || !input.driverLicenseIssueDate
  ) {
    return { error: "Please fill in all driver and license details." };
  }

  const pickup = new Date(input.pickupAt);
  const dropoff = new Date(input.dropoffAt);

  if (isNaN(pickup.getTime()) || isNaN(dropoff.getTime()) || dropoff <= pickup) {
    return { error: "Please select valid pickup and drop-off dates." };
  }

  const [car] = await db.select().from(cars).where(eq(cars.id, input.carId));
  if (!car || !car.isActive) {
    return { error: "This car is no longer available." };
  }

  const [company] = await db.select().from(companies).where(eq(companies.id, car.companyId));
  if (!company || company.status !== "active") {
    return { error: "This company is not currently accepting bookings." };
  }

  // Fast-path check for good UX — catches the common case instantly.
  // This is NOT the actual race-safety guarantee (two simultaneous
  // requests could both pass it). The database exclusion constraint
  // below is what actually prevents the race.
  const conflicts = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.carId, input.carId),
        ne(bookings.status, "cancelled"),
        lt(bookings.pickupAt, dropoff),
        gt(bookings.dropoffAt, pickup)
      )
    );
  if (conflicts.length > 0) {
    return { error: "This car is already booked for part of your selected dates." };
  }

  const blockedConflicts = await db
    .select()
    .from(blockedDates)
    .where(
      and(
        eq(blockedDates.carId, input.carId),
        lt(blockedDates.startDate, dropoff),
        gt(blockedDates.endDate, pickup)
      )
    );
  if (blockedConflicts.length > 0) {
    return { error: "This car is unavailable for part of your selected dates." };
  }

  const days = Math.ceil(
    (dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)
  );
  const rentalTotal = days * Number(car.pricePerDay);
  const depositAmount = Math.round(
    (rentalTotal * Number(car.depositPercentage)) / 100
  );
  const remainingAmount = rentalTotal - depositAmount;
  const cancellationDeadline = new Date(pickup.getTime() - 48 * 60 * 60 * 1000);

  let booking;
  try {
    [booking] = await db
      .insert(bookings)
      .values({
        userId: session.user.id,
        carId: input.carId,
        companyId: car.companyId,
        pickupBranchId: car.branchId,
        dropoffBranchId: car.branchId, // one-way branch selection is a future feature, not yet in the UI
        pickupAt: pickup,
        dropoffAt: dropoff,
        depositAmount: depositAmount.toFixed(2),
        remainingAmount: remainingAmount.toFixed(2),
        platformFee: PLATFORM_FEE.toFixed(2),
        driverName: input.driverName.trim(),
        driverPhone: input.driverPhone.trim(),
        driverCnic: encrypt(input.driverCnic.trim()),
        driverNationality: input.driverNationality.trim(),
        driverAddress: input.driverAddress.trim(),
        driverWorkAddress: input.driverWorkAddress.trim(),
        driverWorkPhone: input.driverWorkPhone.trim(),
        driverLicenseType: input.driverLicenseType.trim(),
        driverLicenseNo: input.driverLicenseNo.trim(),
        driverLicenseIssueDate: new Date(input.driverLicenseIssueDate),
        status: "pending",
        cancellationDeadline,
      })
      .returning();
  } catch (err: any) {
    // 23P01 = Postgres exclusion_violation — the real race-safety net.
    if (err?.code === "23P01") {
      return { error: "This car was just booked by someone else for those dates. Please try different dates." };
    }
    throw err;
  }

  // Save to profile for next time — non-blocking, a failed save shouldn't break a successful booking.
  try {
    await db.update(users).set({
      phone: input.driverPhone.trim(),
      cnicEncrypted: encrypt(input.driverCnic.trim()),
      nationality: input.driverNationality.trim(),
      address: input.driverAddress.trim(),
      workAddress: input.driverWorkAddress.trim(),
      workPhone: input.driverWorkPhone.trim(),
      licenseType: input.driverLicenseType.trim(),
      licenseNo: input.driverLicenseNo.trim(),
      licenseIssueDate: new Date(input.driverLicenseIssueDate),
    }).where(eq(users.id, session.user.id));
  } catch {
    // Non-critical — the booking itself already succeeded.
  }

  redirect(`/bookings/${booking.id}`);
}