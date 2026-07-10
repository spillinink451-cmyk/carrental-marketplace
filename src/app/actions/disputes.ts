"use server";

import { db } from "@/db";
import { disputes, bookings } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function raiseDispute(input: {
  bookingId: string;
  type: "fuel" | "damage" | "no_show" | "fee" | "other";
  description: string;
  evidencePhotos: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, input.bookingId));
  if (!booking || booking.userId !== session.user.id) {
    throw new Error("Booking not found");
  }

  await db.insert(disputes).values({
    bookingId: input.bookingId,
    raisedByUserId: session.user.id,
    type: input.type,
    description: input.description,
    evidencePhotos: input.evidencePhotos,
  });

  await db.update(bookings).set({ status: "disputed" }).where(eq(bookings.id, input.bookingId));

  redirect(`/bookings/${input.bookingId}`);
}