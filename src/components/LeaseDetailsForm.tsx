"use client";

import { useState, useTransition } from "react";
import { updateLeaseVehicleDetails } from "@/app/actions/lease-details";

const inputClass = "border border-gray-200 rounded-xl px-3 py-2 text-sm w-full";

type Lease = {
  id: string; 
  lesseeNationality: string | null; 
  lesseeAddress: string | null; 
  lesseeWorkAddress: string | null;
  lesseeWorkPhone: string | null;
  licenseType: string | null; 
  licenseIssueDate: Date | null | string; 
  drivingLicenseNo: string | null;
  plateNo: string | null; 
  carColor: string | null; 
  kmOut: number | null; kmIn: number | null;
  radioCassette: boolean; 
  airCondition: boolean; 
  insuranceCoverage: string | null;
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
  const [nationality, setNationality] = useState(lease.lesseeNationality ?? "");
  const [address, setAddress] = useState(lease.lesseeAddress ?? "");
  const [workAddress, setWorkAddress] = useState(lease.lesseeWorkAddress ?? "");
  const [workPhone, setWorkPhone] = useState(lease.lesseeWorkPhone ?? "");
  const [licenseType, setLicenseType] = useState(lease.licenseType ?? "");
  const [licenseIssueDate, setLicenseIssueDate] = useState(
  lease.licenseIssueDate ? new Date(lease.licenseIssueDate).toISOString().split("T")[0] : "");
  const [drivingLicenseNo, setDrivingLicenseNo] = useState(lease.drivingLicenseNo ?? "");
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
        lesseeNationality: nationality, lesseeAddress: address, lesseeWorkAddress: workAddress,
        lesseeWorkPhone: workPhone,
        licenseType, licenseIssueDate: licenseIssueDate || undefined, drivingLicenseNo,
        plateNo, carColor, kmOut: kmOut ? Number(kmOut) : undefined, kmIn: kmIn ? Number(kmIn) : undefined,
        radioCassette, airCondition, insuranceCoverage,
      });
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field enLabel="Nationality" arLabel="الجنسية"><input value={nationality} onChange={(e) => setNationality(e.target.value)} className={inputClass} /></Field>
        <Field enLabel="Type of License" arLabel="نوع الرخصة"><input value={licenseType} onChange={(e) => setLicenseType(e.target.value)} className={inputClass} /></Field>
        <Field enLabel="Current Address" arLabel="العنوان الحالي"><input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} /></Field>
        <Field enLabel="Work Address" arLabel="عنوان العمل"><input value={workAddress} onChange={(e) => setWorkAddress(e.target.value)} className={inputClass} /></Field>
        <Field enLabel="Work Phone" arLabel="هاتف العمل"><input value={workPhone} onChange={(e) => setWorkPhone(e.target.value)} className={inputClass} /></Field>
        <Field enLabel="Driving License No." arLabel="رقم رخصة القيادة"><input value={drivingLicenseNo} onChange={(e) => setDrivingLicenseNo(e.target.value)} className={inputClass} /></Field>
        <Field enLabel="License Date of Issue" arLabel="تاريخ اصدار الرخصة"><input type="date" value={licenseIssueDate} onChange={(e) => setLicenseIssueDate(e.target.value)} className={inputClass} /></Field>
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
        {isPending ? "Saving..." : "Save vehicle & renter details"}
      </button>
    </form>
  );
}