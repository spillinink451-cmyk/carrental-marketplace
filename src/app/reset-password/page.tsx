"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/app/actions/password-reset";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await resetPassword({ email, token, newPassword: password });
    setSubmitting(false);
    if (result?.error) setError(result.error);
    else router.push("/login");
  }

  if (!email || !token) {
    return (
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-16 bg-canvas">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-[20px] shadow-sm p-8 text-center">
          <p className="text-red-600 text-sm">Invalid or expired reset link.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-16 bg-canvas">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-[20px] shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Set a new password</h1>
        <p className="text-slate-500 text-sm mb-8">Choose a strong password for your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">New password</label>
            <input
              type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            disabled={submitting}
            className="w-full bg-brand hover:bg-brand-dark text-white font-semibold text-sm py-3.5 rounded-full transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}