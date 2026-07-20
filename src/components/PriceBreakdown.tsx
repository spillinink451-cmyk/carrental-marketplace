// src/components/PriceBreakdown.tsx — full replacement
"use client";

import { useState, useMemo, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/app/actions/bookings";
import { formatCurrency } from "@/lib/currency";
import { PLATFORM_FEE } from "@/lib/constants";

export default function PriceBreakdown({
  carId,
  pricePerDay,
  depositPercentage,
  currency,
  initialPickup = "",
  initialDropoff = "",
  initialDriverName = "",
  initialDriverPhone = "",
  initialDriverCnic = "",
  initialDriverNationality = "",
  initialDriverAddress = "",
  initialDriverLicenseType = "",
  initialDriverLicenseNo = "",
  initialDriverLicenseIssueDate = "",
}: {
  carId: string;
  pricePerDay: number;
  depositPercentage: number;
  currency: string;
  initialPickup?: string;
  initialDropoff?: string;
  initialDriverName?: string;
  initialDriverPhone?: string;
  initialDriverCnic?: string;
  initialDriverNationality?: string;
  initialDriverAddress?: string;
  initialDriverLicenseType?: string;
  initialDriverLicenseNo?: string;
  initialDriverLicenseIssueDate?: string;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [pickup, setPickup] = useState(initialPickup?.split("T")[0] ?? "");
  const [dropoff, setDropoff] = useState(initialDropoff?.split("T")[0] ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [driverName, setDriverName] = useState(initialDriverName);
  const [driverPhone, setDriverPhone] = useState(initialDriverPhone);
  const [driverCnic, setDriverCnic] = useState(initialDriverCnic);
  const [driverNationality, setDriverNationality] = useState(initialDriverNationality);
const [driverAddress, setDriverAddress] = useState(initialDriverAddress);
const [driverLicenseType, setDriverLicenseType] = useState(initialDriverLicenseType);
const [driverLicenseNo, setDriverLicenseNo] = useState(initialDriverLicenseNo);
const [driverLicenseIssueDate, setDriverLicenseIssueDate] = useState(initialDriverLicenseIssueDate);

  const days = useMemo(() => {
    if (!pickup || !dropoff) return 0;
    const diff = (new Date(dropoff).getTime() - new Date(pickup).getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.ceil(diff) : 0;
  }, [pickup, dropoff]);

  const rentalTotal = days * pricePerDay;
  const depositAmount = Math.round((rentalTotal * depositPercentage) / 100);
  const remainingAmount = rentalTotal - depositAmount;
  const grandTotal = rentalTotal + PLATFORM_FEE;

  function handleReserve() {
    setError("");
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/cars/${carId}`);
      return;
    }
    startTransition(async () => {
      const result = await createBooking({
        carId,
        pickupAt: new Date(pickup).toISOString(),
        dropoffAt: new Date(dropoff).toISOString(),
        driverName,
        driverPhone,
        driverCnic,
        driverNationality,
        driverAddress, 
        driverLicenseType, 
        driverLicenseNo, 
        driverLicenseIssueDate,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="border border-gray-200 rounded-[20px] p-6 bg-white shadow-sm sticky top-28">
      <h3 className="font-bold text-slate-800 text-lg mb-4">Select your dates</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Pickup</label>
          <input type="date" value={pickup} onChange={(e) => setPickup(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Drop-off</label>
          <input type="date" value={dropoff} onChange={(e) => setDropoff(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
      </div>

      {days > 0 ? (
        <div className="border-t border-gray-100 pt-4">
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-slate-500">
              <span>{formatCurrency(pricePerDay, currency)} × {days} day{days > 1 ? "s" : ""}</span>
              <span className="font-medium text-slate-700">{formatCurrency(rentalTotal, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Platform service fee</span>
              <span className="font-medium text-slate-700">{formatCurrency(PLATFORM_FEE, currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2 text-slate-800">
              <span>Total</span>
              <span>{formatCurrency(grandTotal, currency)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-brand/5 rounded-xl p-3">
              <span className="text-[10px] uppercase tracking-wide text-brand font-semibold block mb-1">Pay now</span>
              <span className="font-bold text-slate-800">{formatCurrency(depositAmount, currency)}</span>
            </div>
            <div className="bg-amber-50 rounded-xl p-3">
              <span className="text-[10px] uppercase tracking-wide text-amber-600 font-semibold block mb-1">Pay at pickup</span>
              <span className="font-bold text-slate-800">{formatCurrency(remainingAmount, currency)}</span>
            </div>
          </div>

          {error && <p className="text-red-600 text-xs bg-red-50 rounded-lg p-2.5 mb-3">{error}</p>}
          <div className="space-y-3 mb-4 border-t border-gray-100 pt-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Full name</label>
              <input value={driverName} onChange={(e) => setDriverName(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Phone number</label>
              <input value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full" placeholder="03xx-xxxxxxx" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">ID number</label>
              <input value={driverCnic} onChange={(e) => setDriverCnic(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full" placeholder="e.g. xxxxx-xxxxxxx-x" />
            </div>
            <div>
  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Nationality</label>
  <input value={driverNationality} onChange={(e) => setDriverNationality(e.target.value)}
    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full" required />
</div>
<div>
  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Current address</label>
  <input value={driverAddress} onChange={(e) => setDriverAddress(e.target.value)}
    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full" required />
</div>
<div className="grid grid-cols-2 gap-3">
  <div>
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">License type</label>
    <input value={driverLicenseType} onChange={(e) => setDriverLicenseType(e.target.value)}
      className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full" placeholder="e.g. Light Vehicle" required />
  </div>
  <div>
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">License no.</label>
    <input value={driverLicenseNo} onChange={(e) => setDriverLicenseNo(e.target.value)}
      className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full" required />
  </div>
</div>
<div>
  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">License date of issue</label>
  <input type="date" value={driverLicenseIssueDate} onChange={(e) => setDriverLicenseIssueDate(e.target.value)}
    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full" required />
</div>
          </div>

          <button onClick={handleReserve} disabled={isPending}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-full font-semibold text-sm transition-colors disabled:opacity-50">
            {isPending ? "Reserving..." : status === "authenticated" ? "Reserve now" : "Sign in to reserve"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Pick both dates to see pricing.</p>
      )}
    </div>
  );
}