"use server";

import { db } from "@/db";
import { bookings } from "@/db/schema";
import { requireBookingForCompany } from "@/lib/partner-auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createLeaseFromBooking } from "./leases";

export async function approveBooking(bookingId: string) {
  const booking = await requireBookingForCompany(bookingId);
  if (booking.status !== "pending") {
    throw new Error("Only pending bookings can be approved");
  }

  await db
    .update(bookings)
    .set({ status: "confirmed" })
    .where(eq(bookings.id, bookingId));

    await createLeaseFromBooking(bookingId);

  revalidatePath(`/partner/bookings/${bookingId}`);
  revalidatePath(`/bookings/${bookingId}`);
}

export async function rejectBooking(bookingId: string, reason: string) {
  const booking = await requireBookingForCompany(bookingId);
  if (booking.status !== "pending") {
    throw new Error("Only pending bookings can be rejected");
  }

  await db
    .update(bookings)
    .set({ status: "cancelled", rejectionReason: reason })
    .where(eq(bookings.id, bookingId));

  revalidatePath(`/partner/bookings/${bookingId}`);
  revalidatePath(`/bookings/${bookingId}`);
}