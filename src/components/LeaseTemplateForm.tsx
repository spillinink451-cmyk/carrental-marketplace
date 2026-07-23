"use client";

import { useState, useTransition } from "react";
import { saveLeaseTemplate } from "@/app/actions/lease-templates";

const inputClass = "border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full";

type Template = {
  name: string;
  mileageLimitKm: number | null;
  fuelPolicy: string;
  lateFeePerDay: string | null;
  uncleaningFee: string | null;
  excessMileageRate: string | null;
  termsAndConditions: string | null;
  termsAndConditionsAr: string | null;
  additionalTerms: string | null;
  additionalTermsAr: string | null;
} | null;

export default function LeaseTemplateForm({ existing }: { existing: Template }) {
  const [name, setName] = useState(existing?.name ?? "Standard Lease Terms");
  const [termsAndConditions, setTermsAndConditions] = useState(existing?.termsAndConditions ?? "");
  const [termsAndConditionsAr, setTermsAndConditionsAr] = useState(existing?.termsAndConditionsAr ?? "");
  
  const [mileageLimitKm, setMileageLimitKm] = useState(existing?.mileageLimitKm?.toString() ?? "");
  const [fuelPolicy, setFuelPolicy] = useState(existing?.fuelPolicy ?? "Return with the same fuel level as at pickup.");
  const [lateFeePerDay, setLateFeePerDay] = useState(existing?.lateFeePerDay ?? "");
  const [uncleaningFee, setUncleaningFee] = useState(existing?.uncleaningFee ?? "");
  const [excessMileageRate, setExcessMileageRate] = useState(existing?.excessMileageRate ?? "");
  const [additionalTerms, setAdditionalTerms] = useState(existing?.additionalTerms ?? "");
  const [additionalTermsAr, setAdditionalTermsAr] = useState(existing?.additionalTermsAr ?? "");
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
        termsAndConditionsAr: termsAndConditionsAr || undefined,
        mileageLimitKm: mileageLimitKm ? Number(mileageLimitKm) : undefined,
        fuelPolicy,
        lateFeePerDay: lateFeePerDay || undefined,
        uncleaningFee: uncleaningFee || undefined,
        excessMileageRate: excessMileageRate || undefined,
        additionalTerms: additionalTerms || undefined,
        additionalTermsAr: additionalTermsAr || undefined,
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Uncleaned-return fee (optional)</label>
          <input type="number" value={uncleaningFee} onChange={(e) => setUncleaningFee(e.target.value)} className={inputClass} placeholder="e.g. 2.000" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Excess mileage rate (optional)</label>
          <input value={excessMileageRate} onChange={(e) => setExcessMileageRate(e.target.value)} className={inputClass} placeholder="e.g. Over 200 km/day: 50 baisa/km" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Fuel policy</label>
        <input value={fuelPolicy} onChange={(e) => setFuelPolicy(e.target.value)} required className={inputClass} />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Terms &amp; conditions</label>
        <textarea value={termsAndConditions} onChange={(e) => setTermsAndConditions(e.target.value)} rows={8} className={inputClass} />
        <p className="text-xs text-slate-400 mt-1">Leave blank to use the platform's standard terms. Separate paragraphs with a blank line.</p>
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


    <div className="border-t border-gray-100 pt-4">
  <p className="text-xs text-slate-400 mb-3">
    Most rental terms are already covered by the standard clauses above. Use the fields below to add anything specific to your company, without rewriting the whole document.
  </p>
  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Additional terms (optional)</label>
  <textarea value={additionalTerms} onChange={(e) => setAdditionalTerms(e.target.value)} rows={5} className={inputClass} />
</div>
<div>
  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Additional terms — Arabic (optional)</label>
  <textarea value={additionalTermsAr} onChange={(e) => setAdditionalTermsAr(e.target.value)} rows={5} dir="rtl" className={`${inputClass} text-right`} />
</div>


      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      {saved && <p className="text-emerald-600 text-sm bg-emerald-50 rounded-lg px-3 py-2">Saved — new leases will use these terms.</p>}

      <button disabled={isPending} className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm py-3 rounded-full w-full disabled:opacity-50">
        {isPending ? "Saving..." : "Save template"}
      </button>
    </form>
  );
}