"use server";

import { db } from "@/db";
import { companies } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function approveCompany(companyId: string) {
  await requireAdmin();
  await db.update(companies).set({ status: "active" }).where(eq(companies.id, companyId));
  revalidatePath("/admin/companies");
}

export async function suspendCompany(companyId: string) {
  await requireAdmin();
  await db.update(companies).set({ status: "suspended" }).where(eq(companies.id, companyId));
  revalidatePath("/admin/companies");
}