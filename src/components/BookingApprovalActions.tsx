"use client";

import { useState, useTransition } from "react";
import { approveBooking, rejectBooking } from "@/app/actions/booking-approval";

export default function BookingApprovalActions({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  function handleApprove() {
    startTransition(() => approveBooking(bookingId));
  }

  function handleReject() {
    if (!reason.trim()) return;
    startTransition(() => rejectBooking(bookingId, reason));
  }

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-[20px] p-5 mb-6">
      <p className="text-sm font-semibold text-amber-800 mb-3">This booking needs your confirmation</p>

      {!showReject ? (
        <div className="flex gap-2">
          <button
            onClick={handleApprove} disabled={isPending}
            className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors disabled:opacity-50"
          >
            {isPending ? "Confirming..." : "Confirm booking"}
          </button>
          <button
            onClick={() => setShowReject(true)} disabled={isPending}
            className="bg-white border border-gray-200 text-slate-600 text-sm font-semibold px-5 py-2.5 rounded-full hover:border-red-300 hover:text-red-600 transition-colors"
          >
            Reject
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            placeholder="Reason for rejecting (shown to customer)" value={reason} onChange={(e) => setReason(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject} disabled={isPending || !reason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors disabled:opacity-50"
            >
              {isPending ? "Rejecting..." : "Confirm rejection"}
            </button>
            <button onClick={() => setShowReject(false)} className="text-sm text-slate-500 px-3 hover:text-slate-700">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}