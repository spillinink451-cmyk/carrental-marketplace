"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { raiseDispute } from "@/app/actions/disputes";
import PhotoUploader from "@/components/PhotoUploader";

export default function DisputePage() {
  const { id } = useParams<{ id: string }>();
  const [type, setType] = useState("fuel");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await raiseDispute({
      bookingId: id,
      type: type as any,
      description,
      evidencePhotos: photos,
    });
  }

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-16 bg-canvas">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-[20px] shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Report an issue</h1>
        <p className="text-slate-500 text-sm mb-8">We&apos;ll review this and get back to you.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Issue type</label>
            <select
              value={type} onChange={(e) => setType(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            >
              <option value="fuel">Fuel discrepancy</option>
              <option value="damage">Damage dispute</option>
              <option value="no_show">Company didn&apos;t show up</option>
              <option value="fee">Unexpected fee</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Describe what happened</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)} required
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full h-28 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          <PhotoUploader photos={photos} onChange={setPhotos} label="Evidence photos" purpose="evidence" />

          <button
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-3.5 rounded-full transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit dispute"}
          </button>
        </form>
      </div>
    </main>
  );
}