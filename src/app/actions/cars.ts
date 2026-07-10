"use server";

import { db } from "@/db";
import { cars, carBrands, carModels } from "@/db/schema";
import { requireBranchAccess } from "@/lib/partner-auth";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";

export async function createCar(input: {
  branchId: string;
  brandId?: string;
  newBrandName?: string;
  modelId?: string;
  newModelName?: string;
  categoryId: string;
  seats: number;
  transmission: string;
  fuelType: string;
  pricePerDay: string;
  depositPercentage?: string;
  images: string[];
}) {
  const ctx = await requireBranchAccess(input.branchId);

  if (!input.categoryId || !input.seats || !input.transmission || !input.fuelType || !input.pricePerDay) {
    return { error: "Please fill in all required fields." };
  }
  if (!input.images || input.images.length === 0) {
    return { error: "Please upload at least one photo." };
  }
  if (!input.brandId && !input.newBrandName?.trim()) {
    return { error: "Please select or enter a brand." };
  }
  if (!input.modelId && !input.newModelName?.trim()) {
    return { error: "Please select or enter a model." };
  }

  let brandId = input.brandId;
  if (!brandId && input.newBrandName) {
    const [existing] = await db.select().from(carBrands).where(eq(carBrands.name, input.newBrandName.trim()));
    brandId = existing?.id ?? (await db.insert(carBrands).values({ name: input.newBrandName.trim() }).returning())[0].id;
  }
  if (!brandId) return { error: "Could not resolve car brand." };

  let modelId = input.modelId;
  if (!modelId && input.newModelName) {
    const [existing] = await db.select().from(carModels).where(and(eq(carModels.brandId, brandId), eq(carModels.name, input.newModelName.trim())));
    modelId = existing?.id ?? (await db.insert(carModels).values({ brandId, name: input.newModelName.trim() }).returning())[0].id;
  }
  if (!modelId) return { error: "Could not resolve car model." };

  await db.insert(cars).values({
    companyId: ctx.companyId,
    branchId: input.branchId,
    brandId,
    modelId,
    categoryId: input.categoryId,
    seats: input.seats,
    transmission: input.transmission as any,
    fuelType: input.fuelType as any,
    pricePerDay: input.pricePerDay,
    depositPercentage: input.depositPercentage || "20.00",
    images: input.images,
  });

  redirect("/partner");
}