"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LocationDateSearch({ cities }: { cities: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [differentDropoff, setDifferentDropoff] = useState(!!searchParams.get("dropoffLocation"));
  const [dropoffLocation, setDropoffLocation] = useState(searchParams.get("dropoffLocation") ?? "");
  const [pickupAt, setPickupAt] = useState(searchParams.get("pickupAt") ?? "");
  const [dropoffAt, setDropoffAt] = useState(searchParams.get("dropoffAt") ?? "");

  function handleSearch() {
    const params = new URLSearchParams(searchParams.toString());
    location ? params.set("location", location) : params.delete("location");
    differentDropoff && dropoffLocation
      ? params.set("dropoffLocation", dropoffLocation)
      : params.delete("dropoffLocation");
    pickupAt ? params.set("pickupAt", pickupAt) : params.delete("pickupAt");
    dropoffAt ? params.set("dropoffAt", dropoffAt) : params.delete("dropoffAt");
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="border border-line rounded-2xl p-5 sm:p-6 bg-white shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-2 mb-4">
        <div>
          <label className="font-data text-[10px] uppercase tracking-widest text-asphalt block mb-1">
            Pickup location
          </label>
          <select
            className="border border-line rounded-lg px-3 py-2.5 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-route/30 focus:border-route"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Select a city</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="hidden md:flex flex-col items-center justify-end pb-2.5">
          <span className="w-2 h-2 rounded-full bg-route" />
          <span className="flex-1 border-l-2 border-dashed border-line my-1" />
          <span className="w-2 h-2 rounded-full bg-honey" />
        </div>

        <div>
          <label className="font-data text-[10px] uppercase tracking-widest text-asphalt flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              checked={differentDropoff}
              onChange={(e) => setDifferentDropoff(e.target.checked)}
              className="accent-route"
            />
            Return to a different location
          </label>
          <select
            className="border border-line rounded-lg px-3 py-2.5 text-sm w-full bg-white disabled:bg-line/20 disabled:text-asphalt focus:outline-none focus:ring-2 focus:ring-route/30 focus:border-route"
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            disabled={!differentDropoff}
          >
            <option value="">Select a city</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <div>
          <label className="font-data text-[10px] uppercase tracking-widest text-asphalt block mb-1">
            Pickup date &amp; time
          </label>
          <input
            type="datetime-local"
            className="border border-line rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-route/30 focus:border-route"
            value={pickupAt}
            onChange={(e) => setPickupAt(e.target.value)}
          />
        </div>
        <div>
          <label className="font-data text-[10px] uppercase tracking-widest text-asphalt block mb-1">
            Drop-off date &amp; time
          </label>
          <input
            type="datetime-local"
            className="border border-line rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-route/30 focus:border-route"
            value={dropoffAt}
            onChange={(e) => setDropoffAt(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={handleSearch}
        className="w-full md:w-auto bg-route text-paper px-7 py-3 rounded-lg text-sm font-display font-bold uppercase tracking-wide hover:bg-route-dark transition-colors"
      >
        Search cars
      </button>
    </div>
  );
}