"use server";

import { db } from "@/db";
import { companyUsers, users } from "@/db/schema";
import { requireBranchAdminAccess } from "@/lib/partner-auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addStaffMember(input: { branchId: string; email: string }) {
  await requireBranchAdminAccess(input.branchId);

  const [user] = await db.select().from(users).where(eq(users.email, input.email.trim()));
  if (!user) return { error: "No account exists with that email yet — ask them to register first, then try again." };

  const [existingLink] = await db.select().from(companyUsers).where(eq(companyUsers.userId, user.id));
  if (existingLink) return { error: "This person is already linked to a company." };

  const ctx = await requireBranchAdminAccess(input.branchId);
  await db.insert(companyUsers).values({
    companyId: ctx.companyId,
    branchId: input.branchId,
    userId: user.id,
    role: "staff",
  });

  revalidatePath(`/partner/branches/${input.branchId}/staff`);
  return { success: true };
}

export async function removeStaffMember(companyUserId: string, branchId: string) {
  await requireBranchAdminAccess(branchId);
  await db.delete(companyUsers).where(eq(companyUsers.id, companyUserId));
  revalidatePath(`/partner/branches/${branchId}/staff`);
}