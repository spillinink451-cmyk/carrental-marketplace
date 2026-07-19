"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import FadeInWhenVisible from "./motion/FadeInWhenVisible";

type CityData = { city: string; country: string; carCount: number; imagePath: string | null };

export default function BrowseByCity({ cities }: { cities: CityData[] }) {
  const visible = cities.filter((c) => c.carCount > 0).slice(0, 6);
  if (visible.length === 0) return null;

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <FadeInWhenVisible>
          <h2 className="text-slate-800 font-bold text-[32px] sm:text-[38px] text-center mb-2">Browse by city</h2>
          <p className="text-slate-500 text-center mb-12">Available across Pakistan and beyond</p>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((c, i) => (
            <FadeInWhenVisible key={c.city} delay={i * 0.08}>
              <Link href={`/?location=${encodeURIComponent(c.city)}#fleet`}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative h-44 rounded-[20px] overflow-hidden group"
                >
                  {c.imagePath ? (
                    <Image src={c.imagePath} alt={c.city} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand to-slate-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-center gap-1.5 text-xs opacity-80 mb-0.5">
                      <MapPin className="w-3 h-3" />
                      {c.country}
                    </div>
                    <p className="font-bold text-lg">{c.city}</p>
                    <p className="text-xs opacity-80">{c.carCount} car{c.carCount === 1 ? "" : "s"} available</p>
                  </div>
                </motion.div>
              </Link>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}