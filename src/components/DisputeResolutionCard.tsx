"use client";

import { useState, useTransition } from "react";
import { resolveDispute, rejectDispute } from "@/app/actions/admin-disputes";

type Dispute = {
  id: string; type: string; description: string; status: string;
  createdAt: Date; resolutionNotes: string | null; evidencePhotos: string[];
  companyName: string; carBrand: string; carModel: string;
};

export default function DisputeResolutionCard({ dispute, statusStyle }: { dispute: Dispute; statusStyle: string }) {
  const [showForm, setShowForm] = useState<"resolve" | "reject" | null>(null);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const isOpen = dispute.status === "open" || dispute.status === "under_review";

  function handleSubmit(action: "resolve" | "reject") {
    if (!notes.trim()) return;
    startTransition(async () => {
      if (action === "resolve") await resolveDispute(dispute.id, notes);
      else await rejectDispute(dispute.id, notes);
      setShowForm(null);
      setNotes("");
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[20px] p-5">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-semibold text-slate-800 capitalize">{dispute.type.replace("_", " ")}</span>
          <p className="text-sm text-slate-500">{dispute.companyName} &middot; {dispute.carBrand} {dispute.carModel}</p>
        </div>
        <span className={`text-xs uppercase font-semibold px-2.5 py-1 rounded-full ${statusStyle}`}>{dispute.status.replace("_", " ")}</span>
      </div>
      <p className="text-sm text-slate-700 mb-3">{dispute.description}</p>

      {dispute.evidencePhotos.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {dispute.evidencePhotos.map((url) => (
            <img key={url} src={url} className="w-16 h-16 rounded-lg object-cover border border-gray-100" />
          ))}
        </div>
      )}

      {dispute.resolutionNotes && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mb-3">
          <span className="font-semibold">Resolution:</span> {dispute.resolutionNotes}
        </p>
      )}

      {isOpen && (
        <>
          {!showForm ? (
            <div className="flex gap-2">
              <button onClick={() => setShowForm("resolve")} className="bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors">Resolve</button>
              <button onClick={() => setShowForm("reject")} className="bg-white border border-gray-200 text-slate-600 text-xs font-semibold px-4 py-2 rounded-full hover:border-red-300 hover:text-red-600 transition-colors">Reject</button>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder={showForm === "resolve" ? "How was this resolved?" : "Reason for rejecting"}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full" rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSubmit(showForm)} disabled={isPending || !notes.trim()}
                  className="bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-4 py-2 rounded-full disabled:opacity-50"
                >
                  {isPending ? "Saving..." : `Confirm ${showForm}`}
                </button>
                <button onClick={() => setShowForm(null)} className="text-xs text-slate-500 px-2">Cancel</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}