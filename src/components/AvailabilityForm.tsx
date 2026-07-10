"use client";

import { useState, useTransition } from "react";
import { addBlockedDate } from "@/app/actions/availability";

const inputClass =
  "border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand";

export default function AvailabilityForm({ carId }: { carId: string }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await addBlockedDate({ carId, startDate, endDate, reason });
      if (result?.error) {
        setError(result.error);
      } else {
        setStartDate("");
        setEndDate("");
        setReason("");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Start date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">End date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} required />
        </div>
      </div>
      <input
        placeholder="Reason (optional, e.g. maintenance)" value={reason} onChange={(e) => setReason(e.target.value)}
        className={inputClass}
      />
      {error && <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <button disabled={isPending} className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors disabled:opacity-50">
        {isPending ? "Blocking..." : "Block these dates"}
      </button>
    </form>
  );
}