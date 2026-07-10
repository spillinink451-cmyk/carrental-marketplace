"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/password-reset";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await requestPasswordReset(email);
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-16 bg-canvas">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-[20px] shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Reset your password</h1>
        <p className="text-slate-500 text-sm mb-8">We&apos;ll send a link to reset it.</p>

        {submitted ? (
          <div className="bg-emerald-50 text-emerald-700 text-sm rounded-xl px-4 py-3">
            If an account exists for that email, a reset link has been sent.
            <span className="block text-xs text-emerald-600 mt-1">(Dev mode: check your terminal for the link.)</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
            <button
              disabled={submitting}
              className="w-full bg-brand hover:bg-brand-dark text-white font-semibold text-sm py-3.5 rounded-full transition-colors disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <Link href="/login" className="text-sm text-slate-500 text-center block mt-6 hover:text-slate-700">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}