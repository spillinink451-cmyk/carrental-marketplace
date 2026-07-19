"use client";

import FadeInWhenVisible from "./motion/FadeInWhenVisible";

export default function BrandStrip({ brands }: { brands: string[] }) {
  if (brands.length === 0) return null;
  const looped = [...brands, ...brands]; // duplicated for a seamless scroll loop

  return (
    <section className="bg-canvas py-14 overflow-hidden">
      <FadeInWhenVisible>
        <p className="text-center text-slate-400 text-xs font-semibold uppercase tracking-widest mb-6">
          Brands available on Waypoint
        </p>
      </FadeInWhenVisible>
      <div className="flex whitespace-nowrap animate-marquee">
        {looped.map((brand, i) => (
          <span key={`${brand}-${i}`} className="mx-8 text-2xl font-bold text-slate-300 select-none">
            {brand}
          </span>
        ))}
      </div>
    </section>
  );
}