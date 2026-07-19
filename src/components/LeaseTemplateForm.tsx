"use client";

import { useState, useTransition } from "react";
import { saveLeaseTemplate } from "@/app/actions/lease-templates";

const inputClass = "border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full";

type Template = {
  name: string;
  termsAndConditions: string;
  mileageLimitKm: number | null;
  fuelPolicy: string;
  lateFeePerDay: string | null;
  termsAndConditionsAr: string | null;
} | null;

export default function LeaseTemplateForm({ existing }: { existing: Template }) {
  const [name, setName] = useState(existing?.name ?? "Standard Lease Terms");
  const [termsAndConditions, setTermsAndConditions] = useState(existing?.termsAndConditions ?? "");
  const [termsAndConditionsAr, setTermsAndConditionsAr] = useState(existing?.termsAndConditionsAr ?? "");
  const [mileageLimitKm, setMileageLimitKm] = useState(existing?.mileageLimitKm?.toString() ?? "");
  const [fuelPolicy, setFuelPolicy] = useState(existing?.fuelPolicy ?? "Return with the same fuel level as at pickup.");
  const [lateFeePerDay, setLateFeePerDay] = useState(existing?.lateFeePerDay ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    startTransition(async () => {
      const result = await saveLeaseTemplate({
        name,
        termsAndConditions,
        mileageLimitKm: mileageLimitKm ? Number(mileageLimitKm) : undefined,
        fuelPolicy,
        lateFeePerDay: lateFeePerDay || undefined,
        termsAndConditionsAr: termsAndConditionsAr || undefined,
      });
      if (result?.error) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Template name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Mileage limit (km, optional)</label>
          <input type="number" value={mileageLimitKm} onChange={(e) => setMileageLimitKm(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Late fee per day (optional)</label>
          <input type="number" value={lateFeePerDay} onChange={(e) => setLateFeePerDay(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Fuel policy</label>
        <input value={fuelPolicy} onChange={(e) => setFuelPolicy(e.target.value)} required className={inputClass} />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Terms &amp; conditions</label>
        <textarea value={termsAndConditions} onChange={(e) => setTermsAndConditions(e.target.value)} required rows={8} className={inputClass} />
        <p className="text-xs text-slate-400 mt-1">Separate paragraphs with a blank line — they'll render as distinct paragraphs on the signed PDF.</p>
      </div>

      <div>
  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
    Terms &amp; conditions (Arabic) — optional
  </label>
  <textarea
    value={termsAndConditionsAr} onChange={(e) => setTermsAndConditionsAr(e.target.value)}
    rows={8} dir="rtl" className={`${inputClass} text-right`}
  />
  <p className="text-xs text-slate-400 mt-1">Leave blank to use the platform's standard Arabic translation.</p>
</div>

      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      {saved && <p className="text-emerald-600 text-sm bg-emerald-50 rounded-lg px-3 py-2">Saved — new leases will use these terms.</p>}

      <button disabled={isPending} className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm py-3 rounded-full w-full disabled:opacity-50">
        {isPending ? "Saving..." : "Save template"}
      </button>
    </form>
  );
}