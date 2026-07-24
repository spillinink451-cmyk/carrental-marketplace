"use server";

import { db } from "@/db";
import { companies, companyUsers, countries } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function registerCompany(input: {
  name: string;
  contactEmail: string;
  phone: string;
  country: string; // country code
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to register a company." };
  }

  if (!input.name?.trim() || !input.contactEmail?.trim() || !input.phone?.trim() || !input.country) {
    return { error: "Please fill in all fields." };
  }

  const [existingLink] = await db.select().from(companyUsers).where(eq(companyUsers.userId, session.user.id));
  if (existingLink) {
    return { error: "Your account is already linked to a company." };
  }

  const [countryRow] = await db.select().from(countries).where(eq(countries.code, input.country));
  if (!countryRow) {
    return { error: "Please select a valid country." };
  }

  const [company] = await db.insert(companies).values({
    name: input.name.trim(),
    contactEmail: input.contactEmail.trim(),
    phone: input.phone.trim(),
    country: countryRow.code,
    currency: countryRow.currencyCode,
    status: "pending",
  }).returning();

  await db.insert(companyUsers).values({
    companyId: company.id,
    userId: session.user.id,
    role: "owner",
  });

  redirect("/partner?welcome=1");
}