"use client";

import { motion } from "framer-motion";
import FadeInWhenVisible from "./motion/FadeInWhenVisible";

const REVIEWS = [
  { name: "Ayesha K.", rating: 5, review: "Booking took less than five minutes and the car was exactly as described. Handover was smooth and quick.", duration: "4-day rental", category: "SUV" },
  { name: "Bilal R.", rating: 5, review: "Really appreciated the transparent pricing — no surprise charges at pickup like I've had elsewhere.", duration: "2-day rental", category: "Compact" },
  { name: "Hina S.", rating: 4, review: "Great experience overall, support was responsive when I needed to shift my pickup time.", duration: "7-day rental", category: "Economy" },
];

export default function Testimonials() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <FadeInWhenVisible>
          <h2 className="text-slate-800 font-bold text-[32px] sm:text-[38px] text-center mb-12">
            What renters are saying
          </h2>
        </FadeInWhenVisible>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <FadeInWhenVisible key={r.name} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="border border-gray-200 rounded-[20px] p-7 h-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-brand/10 flex items-center justify-center font-semibold text-brand">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{r.name}</p>
                    <p className="text-amber-500 text-xs">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">&ldquo;{r.review}&rdquo;</p>
                <p className="text-slate-400 text-xs">{r.duration} · {r.category}</p>
              </motion.div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}