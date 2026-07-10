// src/components/NewLeaseForm.tsx
"use client";

import { useState, useTransition } from "react";
import { createStandaloneLease } from "@/app/actions/leases";

const inputClass = "border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full";

export default function NewLeaseForm({ cars }: { cars: { id: string; brand: string; model: string }[] }) {
  const [carId, setCarId] = useState(cars[0]?.id ?? "");
  const [lesseeName, setLesseeName] = useState("");
  const [lesseePhone, setLesseePhone] = useState("");
  const [lesseeCnic, setLesseeCnic] = useState("");
  const [lesseeEmail, setLesseeEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!carId || !lesseeName || !lesseePhone || !lesseeCnic || !startDate || !endDate || !pricePerDay || !totalAmount || !depositAmount) {
      setError("Please fill in all required fields.");
      return;
    }
    startTransition(async () => {
      const result = await createStandaloneLease({ carId, lesseeName, lesseePhone, lesseeCnic, lesseeEmail: lesseeEmail || undefined, startDate, endDate, pricePerDay, totalAmount, depositAmount });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select value={carId} onChange={(e) => setCarId(e.target.value)} required className={`${inputClass} bg-white`}>
        {cars.length === 0 && <option value="">No cars available</option>}
        {cars.map((c) => <option key={c.id} value={c.id}>{c.brand} {c.model}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Lessee full name" value={lesseeName} onChange={(e) => setLesseeName(e.target.value)} required className={inputClass} />
        <input placeholder="Phone" value={lesseePhone} onChange={(e) => setLesseePhone(e.target.value)} required className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="National ID number" value={lesseeCnic} onChange={(e) => setLesseeCnic(e.target.value)} required className={inputClass} />
        <input placeholder="Email (optional — links account)" value={lesseeEmail} onChange={(e) => setLesseeEmail(e.target.value)} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className={inputClass} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className={inputClass} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input type="number" placeholder="Price/day" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required className={inputClass} />
        <input type="number" placeholder="Total" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} required className={inputClass} />
        <input type="number" placeholder="Deposit" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} required className={inputClass} />
      </div>
      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <button disabled={isPending} className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm py-3 rounded-full w-full disabled:opacity-50">
        {isPending ? "Creating..." : "Create lease"}
      </button>
    </form>
  );
}