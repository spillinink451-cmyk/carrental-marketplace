"use server";

import { db } from "@/db";
import { leaseAgreements } from "@/db/schema";
import { requireBranchAccess } from "@/lib/partner-auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { regenerateLeasePdfIfSigned } from "./leases";

export async function updateLeaseVehicleDetails(leaseId: string, input: {
  lesseeNationality?: string; 
  lesseeAddress?: string; 
  lesseeWorkAddress?: string;
  lesseeWorkPhone?: string; 
  licenseType?: string; 
  licenseIssueDate?: string; 
  drivingLicenseNo?: string;
  plateNo?: string; 
  uncleaningFee?: string; 
  excessMileageRate?: string; 
  carColor?: string; 
  kmOut?: number; kmIn?: number;
  radioCassette: boolean; 
  airCondition: boolean; 
  insuranceCoverage?: string;
}) {
   const [lease] = await db.select().from(leaseAgreements).where(eq(leaseAgreements.id, leaseId));
  if (!lease) return { error: "Lease not found." };
  await requireBranchAccess(lease.branchId);

  await db.update(leaseAgreements).set({
    lesseeNationality: input.lesseeNationality, 
    lesseeAddress: input.lesseeAddress, 
    lesseeWorkAddress: input.lesseeWorkAddress,
    lesseeWorkPhone: input.lesseeWorkPhone,
    licenseType: input.licenseType, licenseIssueDate: input.licenseIssueDate ? new Date(input.licenseIssueDate) : undefined,
    drivingLicenseNo: input.drivingLicenseNo, plateNo: input.plateNo, 
    uncleaningFee: input.uncleaningFee, 
    excessMileageRate: input.excessMileageRate, 
    carColor: input.carColor,
    kmOut: input.kmOut, kmIn: input.kmIn, 
    radioCassette: input.radioCassette, 
    airCondition: input.airCondition,
    insuranceCoverage: input.insuranceCoverage,
  }).where(eq(leaseAgreements.id, leaseId));

  await regenerateLeasePdfIfSigned(leaseId);
  revalidatePath(`/partner/leases/${leaseId}`);
  return { success: true };
}