"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Car, Zap, Mountain, Crown, Users } from "lucide-react";
import FadeInWhenVisible from "./motion/FadeInWhenVisible";

const CATEGORY_ICONS: Record<string, typeof Car> = {
  economy: Zap,
  compact: Car,
  suv: Mountain,
  luxury: Crown,
  van: Users,
};

export default function BrowseByCategory({ categories }: { categories: { id: string; name: string; count: number }[] }) {
  const visible = categories.filter((c) => c.count > 0);
  if (visible.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <FadeInWhenVisible>
        <h2 className="text-slate-800 font-bold text-[32px] sm:text-[38px] text-center mb-2">Browse by category</h2>
        <p className="text-slate-500 text-center mb-12">Find the right fit for your trip</p>
      </FadeInWhenVisible>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {visible.map((cat, i) => {
          const Icon = CATEGORY_ICONS[cat.name] ?? Car;
          return (
            <FadeInWhenVisible key={cat.id} delay={i * 0.06}>
              <Link href={`/?category=${cat.name}#fleet`}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white border border-gray-200 rounded-[20px] p-6 text-center hover:shadow-lg hover:border-brand/30 transition-shadow"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-brand/10 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-brand" strokeWidth={2} />
                  </div>
                  <p className="font-semibold text-slate-800 capitalize">{cat.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{cat.count} car{cat.count === 1 ? "" : "s"}</p>
                </motion.div>
              </Link>
            </FadeInWhenVisible>
          );
        })}
      </div>
    </section>
  );
}