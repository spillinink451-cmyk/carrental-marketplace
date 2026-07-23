"use server";

import { db } from "@/db";
import { leaseTemplates } from "@/db/schema";
import { requireCompanyOwner } from "@/lib/partner-auth";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveLeaseTemplate(input: {
  name: string;
  termsAndConditions?: string;
  termsAndConditionsAr?: string;
  mileageLimitKm?: number;
  fuelPolicy: string;
  lateFeePerDay?: string;
  uncleaningFee?: string;
  excessMileageRate?: string;
}) {
  const ctx = await requireCompanyOwner();

  if (!input.name?.trim() || !input.fuelPolicy?.trim()) {
    return { error: "Name and fuel policy are required." };
  }

  const [existing] = await db
    .select()
    .from(leaseTemplates)
    .where(eq(leaseTemplates.companyId, ctx.companyId))
    .orderBy(desc(leaseTemplates.createdAt))
    .limit(1);

  const values = {
    name: input.name.trim(),
    termsAndConditions: input.termsAndConditions?.trim() || null,
    termsAndConditionsAr: input.termsAndConditionsAr?.trim() || null,
    mileageLimitKm: input.mileageLimitKm,
    fuelPolicy: input.fuelPolicy.trim(),
    lateFeePerDay: input.lateFeePerDay,
    uncleaningFee: input.uncleaningFee,
    excessMileageRate: input.excessMileageRate?.trim() || null,
  };

  if (existing) {
    await db.update(leaseTemplates).set(values).where(eq(leaseTemplates.id, existing.id));
  } else {
    await db.insert(leaseTemplates).values({ companyId: ctx.companyId, ...values });
  }

  revalidatePath("/partner/lease-template");
  return { success: true };
}