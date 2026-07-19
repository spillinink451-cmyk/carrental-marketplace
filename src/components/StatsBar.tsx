"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./motion/AnimatedCounter";

export default function StatsBar({ cars, companies, cities }: { cars: number; companies: number; cities: number }) {
  const stats = [
    { label: "Cars available", value: cars },
    { label: "Trusted companies", value: companies },
    { label: "Cities covered", value: cities },
  ];

  return (
    <section className="bg-white border-y border-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-3 gap-6 text-center">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <p className="text-3xl sm:text-4xl font-extrabold text-brand">
              <AnimatedCounter value={stat.value} />
              <span className="text-amber-500">+</span>
            </p>
            <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}