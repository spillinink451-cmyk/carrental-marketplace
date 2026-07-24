"use server";

import { db } from "@/db";
import { disputes } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function resolveDispute(disputeId: string, resolutionNotes: string) {
  await requireAdmin();
  if (!resolutionNotes?.trim()) return { error: "Please add resolution notes." };

  await db.update(disputes).set({
    status: "resolved", resolutionNotes: resolutionNotes.trim(), resolvedAt: new Date(),
  }).where(eq(disputes.id, disputeId));

  revalidatePath("/admin/disputes");
  return { success: true };
}

export async function rejectDispute(disputeId: string, resolutionNotes: string) {
  await requireAdmin();
  if (!resolutionNotes?.trim()) return { error: "Please add a reason." };

  await db.update(disputes).set({
    status: "rejected", resolutionNotes: resolutionNotes.trim(), resolvedAt: new Date(),
  }).where(eq(disputes.id, disputeId));

  revalidatePath("/admin/disputes");
  return { success: true };
}