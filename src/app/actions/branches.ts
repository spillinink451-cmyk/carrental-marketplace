"use server";

import { db } from "@/db";
import { branches, companyUsers, users, cities } from "@/db/schema";
import { requireCompanyOwner } from "@/lib/partner-auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { COUNTRY_TIMEZONES } from "@/lib/country-timezones";

export async function createBranch(input: {
  name: string;
  city: string;
  country: string; // country code, e.g. "PK", "OM"
  area?: string;
  address?: string;
  lat?: number;
  lng?: number;
}) {
  const ctx = await requireCompanyOwner();
  if (!input.name?.trim() || !input.city?.trim() || !input.country?.trim()) {
    return { error: "Branch name, city, and country are required." };
  }

  let [cityRow] = await db.select().from(cities).where(and(eq(cities.name, input.city.trim()), eq(cities.countryCode, input.country)));
  if (!cityRow) {
    [cityRow] = await db.insert(cities).values({
      name: input.city.trim(),
      countryCode: input.country,
      timezone: COUNTRY_TIMEZONES[input.country] ?? "UTC",
    }).returning();
  }

  await db.insert(branches).values({
    companyId: ctx.companyId,
    name: input.name.trim(),
    cityId: cityRow.id,
    area: input.area?.trim(),
    address: input.address?.trim(),
    lat: input.lat?.toFixed(6),
    lng: input.lng?.toFixed(6),
  });
  revalidatePath("/partner/branches");
  return { success: true };
}

// assignBranchAdmin stays exactly as it was — unaffected by this change
export async function assignBranchAdmin(input: { branchId: string; email: string }) {
  const ctx = await requireCompanyOwner();
  const [branch] = await db.select().from(branches).where(and(eq(branches.id, input.branchId), eq(branches.companyId, ctx.companyId)));
  if (!branch) return { error: "Branch not found." };
  const [user] = await db.select().from(users).where(eq(users.email, input.email.trim()));
  if (!user) return { error: "No account exists with that email yet — ask them to register first, then try again." };
  const [existingLink] = await db.select().from(companyUsers).where(eq(companyUsers.userId, user.id));
  if (existingLink) return { error: "This person is already linked to a company." };
  await db.insert(companyUsers).values({ companyId: ctx.companyId, branchId: input.branchId, userId: user.id, role: "branch_admin" });
  revalidatePath("/partner/branches");
  return { success: true };
}