import { db } from "./index";
import { companies, branches, cars } from "./schema";

async function seed() {
  console.log("Seeding...");

  const [highwayMotors] = await db.insert(companies).values({
    name: "Highway Motors",
    contactEmail: "ops@highwaymotors.pk",
    phone: "+92 300 1234567",
    commissionRate: "15.00",
    status: "active",
  }).returning();

  const [cityCars] = await db.insert(companies).values({
    name: "City Cars Rentals",
    contactEmail: "info@citycars.pk",
    phone: "+92 300 7654321",
    commissionRate: "12.00",
    status: "active",
  }).returning();

  console.log("Companies created:", highwayMotors.name, cityCars.name);

  const [rwpBranch] = await db.insert(branches).values({
    companyId: highwayMotors.id,
    name: "Highway Motors - Saddar",
    city: "Rawalpindi",
    area: "Saddar",
    address: "Near Committee Chowk, Rawalpindi",
    lat: "33.598900",
    lng: "73.047500",
  }).returning();

  const [islBranch] = await db.insert(branches).values({
    companyId: cityCars.id,
    name: "City Cars - Blue Area",
    city: "Islamabad",
    area: "Blue Area",
    address: "Jinnah Avenue, Islamabad",
    lat: "33.716600",
    lng: "73.078100",
  }).returning();

  console.log("Branches created");

  await db.insert(cars).values([
    { companyId: highwayMotors.id, branchId: rwpBranch.id, brand: "Toyota", model: "Corolla", category: "compact", seats: 5, doors: 4, transmission: "automatic", fuelType: "petrol", images: [], pricePerDay: "6500.00", depositPercentage: "20.00" },
    { companyId: highwayMotors.id, branchId: rwpBranch.id, brand: "Toyota", model: "Fortuner", category: "suv", seats: 7, doors: 4, transmission: "automatic", fuelType: "diesel", images: [], pricePerDay: "15000.00", depositPercentage: "25.00" },
    { companyId: cityCars.id, branchId: islBranch.id, brand: "Honda", model: "Civic", category: "compact", seats: 5, doors: 4, transmission: "automatic", fuelType: "petrol", images: [], pricePerDay: "7000.00", depositPercentage: "20.00" },
    { companyId: cityCars.id, branchId: islBranch.id, brand: "Suzuki", model: "Alto", category: "economy", seats: 4, doors: 4, transmission: "manual", fuelType: "petrol", images: [], pricePerDay: "3500.00", depositPercentage: "15.00" },
  ]);



  const [muscatRentals] = await db.insert(companies).values({
  name: "Muscat Rentals",
  contactEmail: "info@muscatrentals.om",
  phone: "+968 9123 4567",
  commissionRate: "15.00",
  status: "active",
  country: "Oman",
  currency: "OMR",
}).returning();

const [muscatBranch] = await db.insert(branches).values({
  companyId: muscatRentals.id,
  name: "Muscat Rentals - Al Khuwair",
  city: "Muscat",
  area: "Al Khuwair",
  address: "Sultan Qaboos Street, Muscat",
  country: "Oman",
  lat: "23.588000",
  lng: "58.407000",
}).returning();

await db.insert(cars).values([
  {
    companyId: muscatRentals.id,
    branchId: muscatBranch.id,
    brand: "Nissan",
    model: "Sunny",
    category: "economy",
    seats: 5,
    doors: 4,
    transmission: "automatic",
    fuelType: "petrol",
    images: [],
    pricePerDay: "12.500",
    depositPercentage: "20.00",
  },
]);

  console.log("Cars created");
  console.log("Seed complete ✅");
}

seed()
  .then(() => { process.exitCode = 0; })
  .catch((err) => { console.error("Seed failed:", err); process.exitCode = 1; });