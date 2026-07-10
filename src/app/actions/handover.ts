"use server";

import { db } from "@/db";
import { handoverChecks } from "@/db/schema";
import { requireBookingForCompany } from "@/lib/partner-auth";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { leaseAgreements } from "@/db/schema";
import { eq } from "drizzle-orm";



export async function recordHandover(input: { bookingId: string; type: "pickup" | "dropoff"; fuelLevel: number; odometerKm: number; photos: string[]; notes?: string }) {
  await requireBookingForCompany(input.bookingId);
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (input.type === "pickup") {
    const [lease] = await db.select().from(leaseAgreements).where(eq(leaseAgreements.bookingId, input.bookingId));
    if (!lease || lease.status !== "active") {
      throw new Error("The lease agreement must be signed by both parties before pickup can be recorded.");
    }
  }

  await db.insert(handoverChecks).values({ bookingId: input.bookingId, type: input.type, fuelLevel: input.fuelLevel, odometerKm: input.odometerKm, photos: input.photos, notes: input.notes, recordedByUserId: session.user.id });
  redirect(`/partner/bookings/${input.bookingId}`);
}