"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import FadeInWhenVisible from "./motion/FadeInWhenVisible";
import { formatCurrency } from "@/lib/currency";

type Car = {
  id: string;
  brand: string;
  model: string;
  category: string;
  seats: number;
  transmission: string;
  fuelType: string;
  pricePerDay: string;
  companyName: string;
  city: string;
  images: string[];
  currency: string;
};

export default function FeaturedDeals({ cars }: { cars: Car[] }) {
  return (
    <section id="fleet" className="max-w-7xl mx-auto px-6 py-20">
      <FadeInWhenVisible>
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-slate-800 font-bold text-[32px] sm:text-[38px] mb-2">
              Featured Cars
            </h2>
            <p className="text-slate-500">
              {cars.length} cars from trusted local companies
            </p>
          </div>
        </div>
      </FadeInWhenVisible>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car, i) => (
          <FadeInWhenVisible key={car.id} delay={i * 0.08}>
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white border border-gray-200 rounded-[20px] overflow-hidden hover:shadow-xl transition-shadow duration-300 group h-full"
            >
              <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                {car.images?.length > 0 ? (
                  <Image
                    src={car.images[0]}
                    alt={`${car.brand} ${car.model}`}
                    width={800}
                    height={600}
                    className="w-full h-56 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="h-56 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                    No image available
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-slate-800">
                    {car.brand} {car.model}
                  </h3>
                  <span className="shrink-0 text-[10px] uppercase font-semibold tracking-wide text-brand bg-brand/10 px-2.5 py-1 rounded-full">
                    {car.category}
                  </span>
                </div>

                <p className="text-sm text-slate-500 mb-4">
                  {car.companyName} · {car.city}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-5">
                  <span className="capitalize">{car.transmission}</span>
                  <span>•</span>
                  <span className="capitalize">{car.fuelType}</span>
                  <span>•</span>
                  <span>{car.seats} Seats</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="font-bold text-lg text-slate-800">
                    {formatCurrency(car.pricePerDay, car.currency)}
                    <span className="text-xs font-normal text-slate-500"> /day</span>
                  </span>

                  <Link
                    href={`/cars/${car.id}`}
                    className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          </FadeInWhenVisible>
        ))}
      </div>

      {cars.length === 0 && (
        <p className="text-center text-slate-400 mt-12">
          No cars match your search yet.
        </p>
      )}
    </section>
  );
}