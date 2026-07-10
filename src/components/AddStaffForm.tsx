"use client";

import { useState, useTransition } from "react";
import { addStaffMember } from "@/app/actions/staff";

export default function AddStaffForm({ branchId }: { branchId: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await addStaffMember({ branchId, email });
      if (result?.error) setError(result.error);
      else setEmail("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email" placeholder="Staff member's email" value={email} onChange={(e) => setEmail(e.target.value)} required
        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full"
      />
      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <button disabled={isPending} className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors disabled:opacity-50">
        {isPending ? "Adding..." : "Add staff member"}
      </button>
    </form>
  );
}