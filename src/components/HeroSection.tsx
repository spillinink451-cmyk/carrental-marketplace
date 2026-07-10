"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import BookingHeroCard from "./BookingHeroCard";
import AnimatedCounter from "./motion/AnimatedCounter";

export default function HeroSection({
  cities,
  carCount,
  heroImagePath,
}: {
  cities: string[];
  carCount: number;
  heroImagePath: string | null;
}) {
  return (
    <section id="search" className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {heroImagePath ? (
        <>
          <Image src={heroImagePath} alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/85" aria-hidden />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-brand to-slate-800" aria-hidden />
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-blob-1" aria-hidden />
          <div className="absolute top-40 -right-20 w-[28rem] h-[28rem] bg-indigo-400/20 rounded-full blur-3xl animate-blob-2" aria-hidden />
          <div className="absolute inset-0 bg-black/25" aria-hidden />
        </>
      )}

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center mb-10">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-4">
          <AnimatedCounter value={carCount} /> cars ready to book today
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} className="text-white font-extrabold leading-[1.05] text-[40px] sm:text-[52px] lg:text-[62px] mb-4">
          Freedom on four wheels,<br />booked in minutes.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="text-white/80 text-lg max-w-xl mx-auto">
          Compare trusted local rental companies and drive away with total confidence.
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0, y: 32, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 px-6">
        <BookingHeroCard cities={cities} />
      </motion.div>
    </section>
  );
}