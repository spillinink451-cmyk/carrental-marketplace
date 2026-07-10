"use client";

import { useState, useTransition } from "react";
import { assignBranchAdmin } from "@/app/actions/branches";

export default function AssignBranchAdminForm({ branchId }: { branchId: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await assignBranchAdmin({ branchId, email });
      if (result?.error) setError(result.error);
      else setEmail("");
    });
  }

  return (
    <div className="mt-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email" placeholder="Branch admin's email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="border border-gray-200 rounded-lg px-3 py-2 text-xs flex-1"
        />
        <button disabled={isPending} className="bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-50 shrink-0">
          {isPending ? "..." : "Assign"}
        </button>
      </form>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}