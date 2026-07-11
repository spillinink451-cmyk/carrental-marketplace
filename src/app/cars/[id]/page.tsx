// src/app/cars/[id]/page.tsx
import { notFound } from "next/navigation";
import PriceBreakdown from "@/components/PriceBreakdown";
import Image from "next/image";
import { auth } from "@/auth";
import { getCarById, getUserProfile } from "@/db/queries";

export default async function CarDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pickupAt?: string; dropoffAt?: string }>;
}) {
  const { id } = await params;
  const { pickupAt, dropoffAt } = await searchParams;
  const session = await auth();
const profile = session?.user?.id ? await getUserProfile(session.user.id) : null;

  const car = await getCarById(id);

  if (!car) notFound();

  return (
    <main className="bg-slate-50 min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_420px] gap-12">
          {/* LEFT */}
          <div>
            {/* Hero Image */}
            <div className="overflow-hidden rounded-3xl bg-gray-100 shadow-sm mb-8">
              {car.images?.length > 0 ? (
                <Image
                  src={car.images[0]}
                  alt={`${car.brand} ${car.model}`}
                  width={1600}
                  height={1000}
                  priority
                  className="w-full h-[320px] md:h-[420px] lg:h-[520px] object-cover"
                />
              ) : (
                <div className="h-[320px] md:h-[420px] lg:h-[520px] flex items-center justify-center text-slate-400">
                  No image available
                </div>
              )}
            </div>

            {/* Title */}
            <div className="mb-8">
              <span className="inline-flex px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold uppercase tracking-wide mb-4">
                {car.category}
              </span>

              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
                {car.brand} {car.model}
              </h1>

              <p className="mt-3 text-slate-600 text-lg">
                {car.companyName} • {car.area}, {car.city}
              </p>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <SpecCard label="Category" value={car.category} />
              <SpecCard label="Seats" value={`${car.seats}`} />
              <SpecCard label="Transmission" value={car.transmission} />
              <SpecCard label="Fuel" value={car.fuelType} />
            </div>

            {/* About */}
            <section className="bg-white rounded-3xl border border-slate-200 p-8 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                About this vehicle
              </h2>

              <p className="text-slate-600 leading-8">
                This vehicle is ideal for both city driving and long-distance
                travel. It offers a comfortable ride, modern features, excellent
                fuel efficiency, and a reliable driving experience. Perfect for
                business trips, family vacations, or everyday transportation.
              </p>
            </section>

            {/* Pickup */}
            <section className="bg-white rounded-3xl border border-slate-200 p-8 mb-8">
              <h2 className="text-xl font-semibold mb-5">
                Pickup Location
              </h2>

              <div className="space-y-2 text-slate-600">
                <p className="font-semibold text-slate-900">
                  {car.companyName}
                </p>

                <p>
                  {car.area}, {car.city}
                </p>

                <p>{car.address}</p>
              </div>
            </section>

            {/* Rental Info */}
            <section className="bg-white rounded-3xl border border-slate-200 p-8">
              <h2 className="text-xl font-semibold mb-6">
                Rental Information
              </h2>

              <div className="grid md:grid-cols-3 gap-5">
                <InfoCard
                  title="Security Deposit"
                  value={`${Number(car.depositPercentage)}%`}
                />

                <InfoCard
                  title="Fuel Policy"
                  value="Return with same fuel level"
                />

                <InfoCard
                  title="Cancellation"
                  value="Free before booking confirmation"
                />
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="lg:sticky lg:top-28 h-fit">
            <PriceBreakdown
              carId={car.id}
              pricePerDay={Number(car.pricePerDay)}
              depositPercentage={Number(car.depositPercentage)}
              initialPickup={pickupAt}
              initialDropoff={dropoffAt}
              currency={car.currency}
              initialDriverName={profile?.name ?? session?.user?.name ?? ""}
              initialDriverPhone={profile?.phone ?? ""}
              initialDriverCnic={profile?.cnic ?? ""}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function SpecCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
        {label}
      </p>

      <p className="font-semibold text-slate-800 capitalize">
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200">
      <p className="text-sm text-slate-500 mb-2">
        {title}
      </p>

      <p className="font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}