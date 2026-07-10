"use client";

import { useState } from "react";
import { recordHandover } from "@/app/actions/handover";
import PhotoUploader from "./PhotoUploader";

export default function HandoverForm({
  bookingId,
  type,
}: {
  bookingId: string;
  type: "pickup" | "dropoff";
}) {
  const [fuelLevel, setFuelLevel] = useState(100);
  const [odometerKm, setOdometerKm] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (photos.length === 0) {
      alert("At least one photo is required.");
      return;
    }
    setSubmitting(true);
    await recordHandover({ bookingId, type, fuelLevel, odometerKm: Number(odometerKm), photos, notes });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-[20px] p-4 space-y-3">
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Fuel level (%)</label>
        <input
          type="number" min={0} max={100} value={fuelLevel} onChange={(e) => setFuelLevel(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/30" required
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Odometer (km)</label>
        <input
          type="number" value={odometerKm} onChange={(e) => setOdometerKm(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/30" required
        />
      </div>
      <PhotoUploader photos={photos} onChange={setPhotos} label="Photos (required)" purpose="evidence" />
      <textarea
        placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      <button disabled={submitting} className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors disabled:opacity-50">
        {submitting ? "Saving..." : `Record ${type}`}
      </button>
    </form>
  );
}