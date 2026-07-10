"use server";

import { db } from "@/db";
import { blockedDates } from "@/db/schema";
import { requireCarForCompany } from "@/lib/partner-auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addBlockedDate(input: {
  carId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}) {
  await requireCarForCompany(input.carId);

  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return { error: "Please provide a valid date range." };
  }

  await db.insert(blockedDates).values({
    carId: input.carId,
    startDate: start,
    endDate: end,
    reason: input.reason,
  });

  revalidatePath(`/partner/cars/${input.carId}/availability`);
  return { success: true };
}

export async function removeBlockedDate(id: string, carId: string) {
  await requireCarForCompany(carId);
  await db
    .delete(blockedDates)
    .where(and(eq(blockedDates.id, id), eq(blockedDates.carId, carId)));
  revalidatePath(`/partner/cars/${carId}/availability`);
}