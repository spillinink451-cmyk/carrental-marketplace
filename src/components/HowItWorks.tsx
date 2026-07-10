"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Search, GitCompareArrows, KeyRound } from "lucide-react";
import FadeInWhenVisible from "./motion/FadeInWhenVisible";

const STEPS = [
  { icon: Search, step: "01", title: "Search", description: "Tell us where and when — we'll show you every available car nearby." },
  { icon: GitCompareArrows, step: "02", title: "Compare", description: "Compare price, category, and company at a glance, no surprises." },
  { icon: KeyRound, step: "03", title: "Drive", description: "Confirm your booking and pick up your keys, ready to go." },
];

export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-white py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <FadeInWhenVisible>
          <p className="text-brand text-sm font-semibold tracking-widest uppercase text-center mb-3">Simple by design</p>
          <h2 className="text-slate-800 font-bold text-[32px] sm:text-[38px] text-center mb-16">How it works</h2>
        </FadeInWhenVisible>

        <div className="relative">
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] border-t-2 border-dashed border-gray-200" aria-hidden />
          <motion.div
            className="hidden md:block absolute top-10 left-[16%] right-[16%] border-t-2 border-dashed border-brand origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            aria-hidden
          />
          {!shouldReduceMotion && (
            <motion.div
              className="hidden md:block absolute top-[34px] w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.2)]"
              initial={{ left: "16%", opacity: 0 }}
              whileInView={{ left: "84%", opacity: [0, 1, 1, 0] }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.4, delay: 1.1, ease: "easeInOut" }}
              aria-hidden
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {STEPS.map(({ icon: Icon, step, title, description }, i) => (
              <FadeInWhenVisible key={step} delay={i * 0.15}>
                <motion.div
                  whileHover={shouldReduceMotion ? undefined : { rotateX: 4, rotateY: -4, y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ transformStyle: "preserve-3d", perspective: 800 }}
                  className="relative text-center group px-4"
                >
                  <span className="absolute inset-x-0 top-0 text-[90px] font-extrabold text-slate-50 leading-none select-none -z-10">
                    {step}
                  </span>

                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 260, damping: 16, delay: i * 0.15 + 0.15 }}
                    className="relative w-16 h-16 mx-auto rounded-full bg-brand text-white flex items-center justify-center mb-6 shadow-lg shadow-brand/20"
                  >
                    <Icon className="w-7 h-7" strokeWidth={2} />
                  </motion.div>

                  <p className="text-amber-500 font-semibold text-xs tracking-widest mb-1">STEP {step}</p>
                  <h3 className="font-semibold text-xl text-slate-800 mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">{description}</p>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}