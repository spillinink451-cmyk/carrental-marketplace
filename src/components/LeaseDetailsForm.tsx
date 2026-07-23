"use client";

import { useState, useTransition } from "react";
import { updateLeaseVehicleDetails } from "@/app/actions/lease-details";

const inputClass = "border border-gray-200 rounded-xl px-3 py-2 text-sm w-full";

type Lease = {
  id: string;
  plateNo: string | null; carColor: string | null; kmOut: number | null; kmIn: number | null;
  radioCassette: boolean; airCondition: boolean; insuranceCoverage: string | null;
};

function Field({ enLabel, arLabel, children }: { enLabel: string; arLabel: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 block mb-1">
        {enLabel} <span dir="rtl" className="font-arabic text-slate-400">/ {arLabel}</span>
      </label>
      {children}
    </div>
  );
}

export default function LeaseDetailsForm({ lease }: { lease: Lease }) {
  const [plateNo, setPlateNo] = useState(lease.plateNo ?? "");
  const [carColor, setCarColor] = useState(lease.carColor ?? "");
  const [kmOut, setKmOut] = useState(lease.kmOut?.toString() ?? "");
  const [kmIn, setKmIn] = useState(lease.kmIn?.toString() ?? "");
  const [radioCassette, setRadioCassette] = useState(lease.radioCassette);
  const [airCondition, setAirCondition] = useState(lease.airCondition);
  const [insuranceCoverage, setInsuranceCoverage] = useState(lease.insuranceCoverage ?? "Full coverage");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateLeaseVehicleDetails(lease.id, {
        plateNo, carColor,
        kmOut: kmOut ? Number(kmOut) : undefined, kmIn: kmIn ? Number(kmIn) : undefined,
        radioCassette, airCondition, insuranceCoverage,
      });
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-slate-400 -mt-1">
        Renter and license details are already captured from the booking — these are just the physical handover facts.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field enLabel="Plate No." arLabel="رقم اللوحة"><input value={plateNo} onChange={(e) => setPlateNo(e.target.value)} className={inputClass} /></Field>
        <Field enLabel="Color" arLabel="اللون"><input value={carColor} onChange={(e) => setCarColor(e.target.value)} className={inputClass} /></Field>
        <Field enLabel="KM Out" arLabel="الكيلومتر عند الخروج"><input type="number" value={kmOut} onChange={(e) => setKmOut(e.target.value)} className={inputClass} /></Field>
        <Field enLabel="KM In" arLabel="الكيلومتر عند العودة"><input type="number" value={kmIn} onChange={(e) => setKmIn(e.target.value)} className={inputClass} /></Field>
        <Field enLabel="Insurance Coverage" arLabel="تأمين السيارة"><input value={insuranceCoverage} onChange={(e) => setInsuranceCoverage(e.target.value)} className={inputClass} /></Field>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={radioCassette} onChange={(e) => setRadioCassette(e.target.checked)} className="accent-brand" />
          Radio / Cassette <span dir="rtl" className="font-arabic text-slate-400">المسجل الراديو</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={airCondition} onChange={(e) => setAirCondition(e.target.checked)} className="accent-brand" />
          Air Condition <span dir="rtl" className="font-arabic text-slate-400">المكيف</span>
        </label>
      </div>

      {saved && <p className="text-emerald-600 text-sm bg-emerald-50 rounded-lg px-3 py-2">Saved.</p>}
      <button disabled={isPending} className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm py-2.5 px-6 rounded-full disabled:opacity-50">
        {isPending ? "Saving..." : "Save vehicle details"}
      </button>
    </form>
  );
}