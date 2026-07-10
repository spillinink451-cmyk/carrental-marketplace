"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";

const DRIVER_AGES = ["21-24", "25-29", "30-65", "65+"];

export default function BookingHeroCard({ cities }: { cities: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [differentDropoff, setDifferentDropoff] = useState(!!searchParams.get("dropoffLocation"));
  const [dropoffLocation, setDropoffLocation] = useState(searchParams.get("dropoffLocation") ?? "");
  const [pickupAt, setPickupAt] = useState(searchParams.get("pickupAt") ?? "");
  const [dropoffAt, setDropoffAt] = useState(searchParams.get("dropoffAt") ?? "");
  const [driverAge, setDriverAge] = useState(searchParams.get("driverAge") ?? "30-65");
  const [promoCode, setPromoCode] = useState(searchParams.get("promoCode") ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSearch() {
  const params = new URLSearchParams(searchParams.toString());
  location ? params.set("location", location) : params.delete("location");
  differentDropoff && dropoffLocation
    ? params.set("dropoffLocation", dropoffLocation)
    : params.delete("dropoffLocation");
  pickupAt ? params.set("pickupAt", pickupAt) : params.delete("pickupAt");
  dropoffAt ? params.set("dropoffAt", dropoffAt) : params.delete("dropoffAt");
  params.set("driverAge", driverAge);
  promoCode ? params.set("promoCode", promoCode) : params.delete("promoCode");

  startTransition(() => {
    router.push(`/?${params.toString()}#fleet`);
  });
}
  return (
    <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-[20px] shadow-2xl shadow-black/20 p-6 sm:p-8 border border-white/40">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Pickup location</label>
          <select
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Where are you picking up?</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2 mb-1.5">
            <input
              type="checkbox"
              checked={differentDropoff}
              onChange={(e) => setDifferentDropoff(e.target.checked)}
              className="accent-brand"
            />
            Return to a different location
          </label>
          <select
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full bg-white disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            disabled={!differentDropoff}
          >
            <option value="">Drop-off city</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Pickup date &amp; time</label>
          <input
            type="datetime-local"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            value={pickupAt}
            onChange={(e) => setPickupAt(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Return date &amp; time</label>
          <input
            type="datetime-local"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            value={dropoffAt}
            onChange={(e) => setDropoffAt(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Driver age</label>
          <select
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            value={driverAge}
            onChange={(e) => setDriverAge(e.target.value)}
          >
            {DRIVER_AGES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
            Promo code <span className="text-slate-400 normal-case font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="Enter code"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
        </div>
      </div>

<motion.button
  onClick={handleSearch}
  disabled={isPending}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base py-4 rounded-full transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
>
  <Search className="w-5 h-5" />
  {isPending ? "Searching..." : "Search Cars"}
</motion.button>
    </div>
  );
}