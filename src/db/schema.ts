import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { primaryKey, integer } from "drizzle-orm/pg-core";
import { uniqueIndex } from "drizzle-orm/pg-core"; // add to existing import

// ---------- Enums ----------
export const companyStatusEnum = pgEnum("company_status", [
  "pending",
  "active",
  "suspended",
]);



export const transmissionEnum = pgEnum("transmission", [
  "automatic",
  "manual",
]);

export const fuelTypeEnum = pgEnum("fuel_type", [
  "petrol",
  "diesel",
  "hybrid",
  "electric",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "active",
  "completed",
  "cancelled",
  "disputed",
]);

// ---------- Auth ----------
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  phone: text("phone"),
  cnicEncrypted: text("cnic_encrypted"),
  nationality: text("nationality"),
  address: text("address"),
  licenseType: text("license_type"),
  licenseNo: text("license_no"),
  licenseIssueDate: timestamp("license_issue_date"),


});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compositePk: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ---------- Companies ----------
export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  contactEmail: text("contact_email").notNull(),
  phone: text("phone"),
country: text("country").notNull().default("PK").references(() => countries.code),
currency: text("currency").notNull().default("PKR").references(() => currencies.code),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 })
    .notNull()
    .default("15.00"), // percentage, e.g. 15.00 = 15%
  status: companyStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const companyRoleEnum = pgEnum("company_role", ["owner", "branch_admin", "staff"]);


export const branchStatusEnum = pgEnum("branch_status", ["active", "inactive"]);


export const companyUsers = pgTable("company_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  branchId: uuid("branch_id").references(() => branches.id, { onDelete: "cascade" }), // null = company-wide (owner)
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: companyRoleEnum("role").notNull().default("owner"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Locations ----------
export const branches = pgTable("branches", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  cityId: uuid("city_id").notNull().references(() => cities.id),
  area: text("area"),
  address: text("address"),
  lat: numeric("lat", { precision: 9, scale: 6 }),
  lng: numeric("lng", { precision: 9, scale: 6 }),
  status: branchStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});



export const countries = pgTable("countries", {
  code: text("code").primaryKey(), // ISO 3166-1 alpha-2, e.g. "PK", "OM"
  name: text("name").notNull(),
  currencyCode: text("currency_code").notNull().references(() => currencies.code),
  dialCode: text("dial_code"),
  idDocumentLabel: text("id_document_label").notNull().default("National ID"),
});
export const currencies = pgTable("currencies", {
  code: text("code").primaryKey(), // ISO 4217, e.g. "PKR", "OMR"
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  decimalPlaces: integer("decimal_places").notNull().default(2),
});




export const carBrands = pgTable("car_brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const carModels = pgTable("car_models", {
  id: uuid("id").defaultRandom().primaryKey(),
  brandId: uuid("brand_id").notNull().references(() => carBrands.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  brandNameUnique: uniqueIndex("car_models_brand_name_idx").on(table.brandId, table.name),
}));

export const carCategories = pgTable("car_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cities = pgTable("cities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  countryCode: text("country_code").notNull().references(() => countries.code),
  timezone: text("timezone").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  countryNameUnique: uniqueIndex("cities_country_name_idx").on(table.countryCode, table.name),
}));

export const leaseTemplates = pgTable("lease_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  termsAndConditions: text("terms_and_conditions"),
  termsAndConditionsAr: text("terms_and_conditions_ar"),
  mileageLimitKm: integer("mileage_limit_km"), 
  fuelPolicy: text("fuel_policy").notNull().default("Return with the same fuel level as at pickup."),
  lateFeePerDay: numeric("late_fee_per_day", { precision: 10, scale: 2 }),
  uncleaningFee: numeric("uncleaning_fee", { precision: 10, scale: 2 }),
excessMileageRate: text("excess_mileage_rate"),
  createdAt: timestamp("created_at").notNull().defaultNow(),

});


// ---------- Cars ----------
export const cars = pgTable("cars", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id").notNull().references(() => branches.id, { onDelete: "cascade" }),
  brandId: uuid("brand_id").notNull().references(() => carBrands.id),
  modelId: uuid("model_id").notNull().references(() => carModels.id),
  categoryId: uuid("category_id").notNull().references(() => carCategories.id),
  seats: integer("seats").notNull(),
  doors: integer("doors"),
  transmission: transmissionEnum("transmission").notNull(),
  fuelType: fuelTypeEnum("fuel_type").notNull(),
  images: text("images").array().notNull().default([]),
  pricePerDay: numeric("price_per_day", { precision: 10, scale: 2 }).notNull(),
  depositPercentage: numeric("deposit_percentage", { precision: 5, scale: 2 })
    .notNull()
    .default("20.00"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Bookings ----------
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
userId: uuid("user_id")
  .notNull()
  .references(() => users.id),  carId: uuid("car_id")
    .notNull()
    .references(() => cars.id),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  pickupBranchId: uuid("pickup_branch_id").notNull().references(() => branches.id),
dropoffBranchId: uuid("dropoff_branch_id").notNull().references(() => branches.id),
  pickupAt: timestamp("pickup_at").notNull(),
  dropoffAt: timestamp("dropoff_at").notNull(),
  driverName: text("driver_name").notNull(),
  driverPhone: text("driver_phone").notNull(),
  driverCnic: text("driver_cnic").notNull(),
  driverNationality: text("driver_nationality"),
  driverAddress: text("driver_address"),
  driverLicenseType: text("driver_license_type"),
  driverLicenseNo: text("driver_license_no"),
  driverLicenseIssueDate: timestamp("driver_license_issue_date"),
  depositAmount: numeric("deposit_amount", { precision: 10, scale: 2 }).notNull(),
  remainingAmount: numeric("remaining_amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: numeric("platform_fee", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  status: bookingStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  cancellationDeadline: timestamp("cancellation_deadline").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


export const leaseStatusEnum = pgEnum("lease_status", [
  "draft",
  "active",
  "completed",
  "terminated",
  "cancelled",
]);

export const leaseAgreements = pgTable("lease_agreements", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  branchId: uuid("branch_id").notNull().references(() => branches.id),
  carId: uuid("car_id").notNull().references(() => cars.id),
  templateId: uuid("template_id").references(() => leaseTemplates.id),
  lesseeUserId: uuid("lessee_user_id").references(() => users.id),
  lesseeName: text("lessee_name").notNull(),
  lesseePhone: text("lessee_phone").notNull(),
  lesseeWorkPhone: text("lessee_work_phone"),
  termsAndConditionsAr: text("terms_and_conditions_ar"),
  lesseeNationality: text("lessee_nationality"),
  lesseeAddress: text("lessee_address"),
  lesseeWorkAddress: text("lessee_work_address"),
  licenseType: text("license_type"),
  licenseIssueDate: timestamp("license_issue_date"),
  drivingLicenseNo: text("driving_license_no"),
  plateNo: text("plate_no"),
  carColor: text("car_color"),
  uncleaningFee: numeric("uncleaning_fee", { precision: 10, scale: 2 }),
  excessMileageRate: text("excess_mileage_rate"),
  kmOut: integer("km_out"),
  kmIn: integer("km_in"),
  radioCassette: boolean("radio_cassette").notNull().default(false),
  airCondition: boolean("air_condition").notNull().default(true),
  insuranceCoverage: text("insurance_coverage").default("Full coverage"),
  lesseeCnicEncrypted: text("lessee_cnic_encrypted").notNull(),
  lesseeEmail: text("lessee_email"),
  carSnapshot: text("car_snapshot").notNull(),
  companyNameSnapshot: text("company_name_snapshot").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  pricePerDay: numeric("price_per_day", { precision: 10, scale: 2 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  depositAmount: numeric("deposit_amount", { precision: 10, scale: 2 }).notNull(),
  mileageLimitKm: integer("mileage_limit_km"),
  fuelPolicy: text("fuel_policy").notNull().default("Return with the same fuel level as at pickup."),
  lateFeePerDay: numeric("late_fee_per_day", { precision: 10, scale: 2 }),
  termsAndConditions: text("terms_and_conditions").notNull(),
  status: leaseStatusEnum("status").notNull().default("draft"),
  customerSignatureUrl: text("customer_signature_url"),
  customerSignedAt: timestamp("customer_signed_at"),
  companySignatureUrl: text("company_signature_url"),
  companySignedAt: timestamp("company_signed_at"),
  companySignedByUserId: uuid("company_signed_by_user_id").references(() => users.id),
  pdfUrl: text("pdf_url"),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


export const handoverTypeEnum = pgEnum("handover_type", ["pickup", "dropoff"]);

export const disputeTypeEnum = pgEnum("dispute_type", [
  "fuel",
  "damage",
  "no_show",
  "fee",
  "other",
]);

export const disputeStatusEnum = pgEnum("dispute_status", [
  "open",
  "under_review",
  "resolved",
  "rejected",
]);

// ---------- Handover checks (pickup/return verification) ----------
export const handoverChecks = pgTable("handover_checks", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  type: handoverTypeEnum("type").notNull(),
  fuelLevel: integer("fuel_level").notNull(), // 0-100, percentage
  odometerKm: integer("odometer_km").notNull(),
  photos: text("photos").array().notNull().default([]),
  notes: text("notes"),
  recordedByUserId: uuid("recorded_by_user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Disputes ----------
export const disputes = pgTable("disputes", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  raisedByUserId: uuid("raised_by_user_id")
    .notNull()
    .references(() => users.id),
  type: disputeTypeEnum("type").notNull(),
  description: text("description").notNull(),
  evidencePhotos: text("evidence_photos").array().notNull().default([]),
  status: disputeStatusEnum("status").notNull().default("open"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const blockedDates = pgTable("blocked_dates", {
  id: uuid("id").defaultRandom().primaryKey(),
  carId: uuid("car_id")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});