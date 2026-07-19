import { db } from "./index";
import { cars, companies, branches, bookings, blockedDates, handoverChecks, disputes, users, companyUsers, countries, carBrands, carModels, carCategories, cities, leaseAgreements, leaseTemplates } from "./schema";
import { and, eq, notInArray, lt, gt, ne, type SQL, desc, sql } from "drizzle-orm";


import { asc } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";


export type CarFilters = {
  city?: string;
  category?: string;
  transmission?: string;
  pickupAt?: string;
  dropoffAt?: string;
};




export async function getUserProfile(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return null;
  return {
    name: user.name,
    phone: user.phone,
    cnic: user.cnicEncrypted ? decrypt(user.cnicEncrypted) : null,
  };
}

export async function getPartnerLinkForUser(userId: string) {
  const [row] = await db.select({ role: companyUsers.role }).from(companyUsers).where(eq(companyUsers.userId, userId));
  return row ?? null;
}

export async function getBlockedDates(carId: string) {
  return db
    .select()
    .from(blockedDates)
    .where(eq(blockedDates.carId, carId))
    .orderBy(asc(blockedDates.startDate));
}

export async function getHomepageStats() {
  const [carCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cars)
    .innerJoin(companies, eq(cars.companyId, companies.id))
    .where(and(eq(cars.isActive, true), eq(companies.status, "active")));

  const [companyCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(companies)
    .where(eq(companies.status, "active"));

  const [cityCount] = await db
    .select({ count: sql<number>`count(distinct ${branches.cityId})::int` })
    .from(branches)
    .innerJoin(companies, eq(branches.companyId, companies.id))
    .where(eq(companies.status, "active"));

  return { cars: carCount?.count ?? 0, companies: companyCount?.count ?? 0, cities: cityCount?.count ?? 0 };
}

export async function getCategoryStats() {
  const categoriesList = await db.select().from(carCategories);
  const counts = await db
    .select({ categoryId: cars.categoryId, count: sql<number>`count(*)::int` })
    .from(cars)
    .innerJoin(companies, eq(cars.companyId, companies.id))
    .where(and(eq(cars.isActive, true), eq(companies.status, "active")))
    .groupBy(cars.categoryId);

  return categoriesList.map((cat) => ({
    id: cat.id,
    name: cat.name,
    count: counts.find((c) => c.categoryId === cat.id)?.count ?? 0,
  }));
}

export async function getCityStats() {
  const rows = await db
    .select({
      city: cities.name,
      country: countries.name,
      carCount: sql<number>`count(${cars.id})::int`,
    })
    .from(cities)
    .innerJoin(branches, eq(branches.cityId, cities.id))
    .innerJoin(companies, eq(branches.companyId, companies.id))
    .innerJoin(countries, eq(cities.countryCode, countries.code))
    .leftJoin(cars, and(eq(cars.branchId, branches.id), eq(cars.isActive, true)))
    .where(eq(companies.status, "active"))
    .groupBy(cities.name, countries.name);

  // Sorted in JS rather than in the query itself — simpler and safer than
  // an aggregate ORDER BY across a grouped query.
  return rows.sort((a, b) => b.carCount - a.carCount);
}

export async function getActiveBrandNames() {
  const rows = await db
    .selectDistinct({ brand: carBrands.name })
    .from(cars)
    .innerJoin(carBrands, eq(cars.brandId, carBrands.id))
    .innerJoin(companies, eq(cars.companyId, companies.id))
    .where(and(eq(cars.isActive, true), eq(companies.status, "active")));
  return rows.map((r) => r.brand);
}

export async function getActiveCars(filters: CarFilters = {}) {
  const conditions: SQL[] = [eq(cars.isActive, true), eq(companies.status, "active")];

  if (filters.category) conditions.push(eq(carCategories.name, filters.category));
  if (filters.transmission) conditions.push(eq(cars.transmission, filters.transmission as any));
  if (filters.city) conditions.push(eq(cities.name, filters.city));

  if (filters.pickupAt && filters.dropoffAt) {
    const pickup = new Date(filters.pickupAt);
    const dropoff = new Date(filters.dropoffAt);
    if (!isNaN(pickup.getTime()) && !isNaN(dropoff.getTime()) && dropoff > pickup) {
      const bookedCarIds = await db.selectDistinct({ carId: bookings.carId }).from(bookings)
        .where(and(ne(bookings.status, "cancelled"), lt(bookings.pickupAt, dropoff), gt(bookings.dropoffAt, pickup)));
      const blockedCarIds = await db.selectDistinct({ carId: blockedDates.carId }).from(blockedDates)
        .where(and(lt(blockedDates.startDate, dropoff), gt(blockedDates.endDate, pickup)));
      const unavailableIds = [...bookedCarIds.map((b) => b.carId), ...blockedCarIds.map((b) => b.carId)];
      if (unavailableIds.length > 0) conditions.push(notInArray(cars.id, unavailableIds));
    }
  }

  return db
    .select({
              id: cars.id, brand: carBrands.name, model: carModels.name, category: carCategories.name,
              seats: cars.seats, transmission: cars.transmission, fuelType: cars.fuelType,
              pricePerDay: cars.pricePerDay, images: cars.images, companyName: companies.name, city: cities.name,
              currency: companies.currency,
            })
    .from(cars)
    .innerJoin(companies, eq(cars.companyId, companies.id))
    .innerJoin(branches, eq(cars.branchId, branches.id))
    .innerJoin(cities, eq(branches.cityId, cities.id))
    .innerJoin(carBrands, eq(cars.brandId, carBrands.id))
    .innerJoin(carModels, eq(cars.modelId, carModels.id))
    .innerJoin(carCategories, eq(cars.categoryId, carCategories.id))
    .where(and(...conditions));
}



export async function getCities() {
  const rows = await db.selectDistinct({ city: cities.name }).from(branches)
    .innerJoin(cities, eq(branches.cityId, cities.id))
    .innerJoin(companies, eq(branches.companyId, companies.id))
    .where(eq(companies.status, "active"));
  return rows.map((r) => r.city);
}

export async function getCarById(id: string) {
  const [car] = await db
    .select({
      id: cars.id, brand: carBrands.name, model: carModels.name, category: carCategories.name,
      seats: cars.seats, doors: cars.doors, transmission: cars.transmission, fuelType: cars.fuelType,
      pricePerDay: cars.pricePerDay, depositPercentage: cars.depositPercentage, images: cars.images,
      companyName: companies.name, branchId: branches.id, city: cities.name, area: branches.area, address: branches.address,
      currency: companies.currency,
    })
    .from(cars)
    .innerJoin(companies, eq(cars.companyId, companies.id))
    .innerJoin(branches, eq(cars.branchId, branches.id))
    .innerJoin(cities, eq(branches.cityId, cities.id))
    .innerJoin(carBrands, eq(cars.brandId, carBrands.id))
    .innerJoin(carModels, eq(cars.modelId, carModels.id))
    .innerJoin(carCategories, eq(cars.categoryId, carCategories.id))
    .where(eq(cars.id, id));
  return car ?? null;
}

export async function getBookingById(id: string) {
  const [row] = await db
    .select({
      id: bookings.id, userId: bookings.userId, pickupAt: bookings.pickupAt, dropoffAt: bookings.dropoffAt,
      depositAmount: bookings.depositAmount, remainingAmount: bookings.remainingAmount, platformFee: bookings.platformFee,
      status: bookings.status, rejectionReason: bookings.rejectionReason, cancellationDeadline: bookings.cancellationDeadline,
      driverName: bookings.driverName, driverPhone: bookings.driverPhone, driverCnic: bookings.driverCnic,
      carBrand: carBrands.name, carModel: carModels.name, companyName: companies.name,
      locationCity: cities.name, locationAddress: branches.address,
      currency: companies.currency, idDocumentLabel: countries.idDocumentLabel,
      timezone: cities.timezone,
    })
    .from(bookings)
    .innerJoin(cars, eq(bookings.carId, cars.id))
    .innerJoin(carBrands, eq(cars.brandId, carBrands.id))
    .innerJoin(carModels, eq(cars.modelId, carModels.id))
    .innerJoin(companies, eq(bookings.companyId, companies.id))
    .innerJoin(countries, eq(companies.country, countries.code))
    .innerJoin(branches, eq(bookings.pickupBranchId, branches.id))
    .innerJoin(cities, eq(branches.cityId, cities.id))
    .where(eq(bookings.id, id));
  if (!row) return null;
  return { ...row, driverCnic: decrypt(row.driverCnic) };
}


export async function getCarsByCompany(companyId: string) {
  return db
    .select({ id: cars.id, brand: carBrands.name, model: carModels.name, category: carCategories.name, pricePerDay: cars.pricePerDay, branchId: cars.branchId })
    .from(cars)
    .innerJoin(carBrands, eq(cars.brandId, carBrands.id))
    .innerJoin(carModels, eq(cars.modelId, carModels.id))
    .innerJoin(carCategories, eq(cars.categoryId, carCategories.id))
    .where(eq(cars.companyId, companyId));
}


export async function getBookingsByCompany(companyId: string) {
  return db
    .select({
      id: bookings.id, pickupAt: bookings.pickupAt, dropoffAt: bookings.dropoffAt, status: bookings.status,
      carBrand: carBrands.name, carModel: carModels.name,
      timezone: cities.timezone,
    })
    .from(bookings)
    .innerJoin(cars, eq(bookings.carId, cars.id))
    .innerJoin(carBrands, eq(cars.brandId, carBrands.id))
    .innerJoin(carModels, eq(cars.modelId, carModels.id))
    .innerJoin(branches, eq(bookings.pickupBranchId, branches.id))
    .innerJoin(cities, eq(branches.cityId, cities.id))
    .where(eq(bookings.companyId, companyId));
}

export async function getBookingsForUser(userId: string) {
  return db
    .select({
      id: bookings.id, pickupAt: bookings.pickupAt, dropoffAt: bookings.dropoffAt, status: bookings.status,
      carBrand: carBrands.name, carModel: carModels.name, companyName: companies.name,
      timezone: cities.timezone,
    })
    .from(bookings)
    .innerJoin(cars, eq(bookings.carId, cars.id))
    .innerJoin(carBrands, eq(cars.brandId, carBrands.id))
    .innerJoin(carModels, eq(cars.modelId, carModels.id))
    .innerJoin(companies, eq(bookings.companyId, companies.id))
    .innerJoin(branches, eq(bookings.pickupBranchId, branches.id))
    .innerJoin(cities, eq(branches.cityId, cities.id))
    .where(eq(bookings.userId, userId));
}

export async function getHandoverChecks(bookingId: string) {
  return db.select().from(handoverChecks).where(eq(handoverChecks.bookingId, bookingId));
}

export async function getDisputesForBooking(bookingId: string) {
  return db.select().from(disputes).where(eq(disputes.bookingId, bookingId));
}

export async function getDisputesForCompany(companyId: string) {
  return db
    .select({ id: disputes.id, type: disputes.type, description: disputes.description, status: disputes.status, createdAt: disputes.createdAt, bookingId: disputes.bookingId, carBrand: carBrands.name, carModel: carModels.name })
    .from(disputes)
    .innerJoin(bookings, eq(disputes.bookingId, bookings.id))
    .innerJoin(cars, eq(bookings.carId, cars.id))
    .innerJoin(carBrands, eq(cars.brandId, carBrands.id))
    .innerJoin(carModels, eq(cars.modelId, carModels.id))
    .where(eq(bookings.companyId, companyId));
}

export async function getBranchesForCompany(companyId: string) {
  return db
    .select({ id: branches.id, name: branches.name, area: branches.area, address: branches.address, status: branches.status, city: cities.name, countryCode: cities.countryCode })
    .from(branches)
    .innerJoin(cities, eq(branches.cityId, cities.id))
    .where(eq(branches.companyId, companyId));
}

export async function getBranchTimezone(branchId: string): Promise<string> {
  const [row] = await db
    .select({ timezone: cities.timezone })
    .from(branches)
    .innerJoin(cities, eq(branches.cityId, cities.id))
    .where(eq(branches.id, branchId));
  return row?.timezone ?? "UTC";
}

export async function getBranchAdmins(companyId: string) {
  return db
    .select({
      id: companyUsers.id,
      branchId: companyUsers.branchId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(companyUsers)
    .innerJoin(users, eq(companyUsers.userId, users.id))
    .where(and(eq(companyUsers.companyId, companyId), eq(companyUsers.role, "branch_admin")));
}

export async function getStaffForBranch(branchId: string) {
  return db
    .select({
      id: companyUsers.id,
      userName: users.name,
      userEmail: users.email,
    })
    .from(companyUsers)
    .innerJoin(users, eq(companyUsers.userId, users.id))
    .where(and(eq(companyUsers.branchId, branchId), eq(companyUsers.role, "staff")));
}

export async function getCarsByBranch(branchId: string) {
  return db
    .select({ id: cars.id, brand: carBrands.name, model: carModels.name, category: carCategories.name, pricePerDay: cars.pricePerDay })
    .from(cars)
    .innerJoin(carBrands, eq(cars.brandId, carBrands.id))
    .innerJoin(carModels, eq(cars.modelId, carModels.id))
    .innerJoin(carCategories, eq(cars.categoryId, carCategories.id))
    .where(eq(cars.branchId, branchId));
}

export async function getBookingsByBranch(branchId: string) {
  return db
    .select({
      id: bookings.id, pickupAt: bookings.pickupAt, dropoffAt: bookings.dropoffAt, status: bookings.status,
      carBrand: carBrands.name, carModel: carModels.name,
      timezone: cities.timezone,
    })
    .from(bookings)
    .innerJoin(cars, eq(bookings.carId, cars.id))
    .innerJoin(carBrands, eq(cars.brandId, carBrands.id))
    .innerJoin(carModels, eq(cars.modelId, carModels.id))
    .innerJoin(branches, eq(bookings.pickupBranchId, branches.id))
    .innerJoin(cities, eq(branches.cityId, cities.id))
    .where(eq(bookings.pickupBranchId, branchId));
}


export async function getCountries() {
  return db.select().from(countries);
}

export async function getCarCategories() {
  return db.select().from(carCategories);
}

export async function getBrandsWithModels() {
  const [allBrands, allModels] = await Promise.all([db.select().from(carBrands), db.select().from(carModels)]);
  return allBrands.map((brand) => ({ ...brand, models: allModels.filter((m) => m.brandId === brand.id) }));
}

export async function getLeaseByBookingId(bookingId: string) {
  const [lease] = await db.select().from(leaseAgreements).where(eq(leaseAgreements.bookingId, bookingId));
  return lease ?? null;
}

export async function getLeaseById(id: string) {
  const [row] = await db
    .select({
      lease: leaseAgreements,
      currency: companies.currency,
      idDocumentLabel: countries.idDocumentLabel,
      timezone: cities.timezone,
    })
    .from(leaseAgreements)
    .innerJoin(companies, eq(leaseAgreements.companyId, companies.id))
    .innerJoin(countries, eq(companies.country, countries.code))
    .innerJoin(branches, eq(leaseAgreements.branchId, branches.id))
    .innerJoin(cities, eq(branches.cityId, cities.id))
    .where(eq(leaseAgreements.id, id));
  if (!row) return null;
  return { ...row.lease, currency: row.currency, idDocumentLabel: row.idDocumentLabel, timezone: row.timezone };
}

export async function getCarsForBranchSimple(branchId: string) {
  return db
    .select({ id: cars.id, brand: carBrands.name, model: carModels.name, pricePerDay: cars.pricePerDay })
    .from(cars)
    .innerJoin(carBrands, eq(cars.brandId, carBrands.id))
    .innerJoin(carModels, eq(cars.modelId, carModels.id))
    .where(eq(cars.branchId, branchId));
}

export async function getLeaseTemplateForCompany(companyId: string) {
  const [template] = await db
    .select()
    .from(leaseTemplates)
    .where(eq(leaseTemplates.companyId, companyId))
    .orderBy(desc(leaseTemplates.createdAt))
    .limit(1);
  return template ?? null;
}