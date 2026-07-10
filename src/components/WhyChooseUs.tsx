"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Wallet, Headset, BadgeCheck } from "lucide-react";
import FadeInWhenVisible from "./motion/FadeInWhenVisible";

const ITEMS = [
  { icon: ShieldCheck, title: "Free Cancellation", description: "Cancel up to 48 hours before pickup, no questions asked." },
  { icon: Wallet, title: "No Hidden Fees", description: "Transparent pricing — you see the full cost before you book." },
  { icon: Headset, title: "24/7 Customer Support", description: "Real people, available whenever your trip needs them." },
  { icon: BadgeCheck, title: "Best Price Guarantee", description: "Competitive rates from vetted local rental companies." },
];

export default function WhyChooseUs() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <FadeInWhenVisible>
        <h2 className="text-slate-800 font-bold text-[32px] sm:text-[38px] text-center mb-12">
          Why rent with us
        </h2>
      </FadeInWhenVisible>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ITEMS.map(({ icon: Icon, title, description }, i) => (
          <FadeInWhenVisible key={title} delay={i * 0.1}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white border border-gray-200 rounded-[20px] p-7 hover:shadow-lg transition-shadow duration-200 h-full"
            >
              <motion.div
                whileHover={{ rotate: 12, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mb-5"
              >
                <Icon className="w-6 h-6 text-brand" strokeWidth={2} />
              </motion.div>
              <h3 className="font-semibold text-lg text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
            </motion.div>
          </FadeInWhenVisible>
        ))}
      </div>
    </section>
  );
}