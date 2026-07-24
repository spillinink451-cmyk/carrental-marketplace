"use client";

import { useState, useTransition } from "react";
import { registerCompany } from "@/app/actions/partner-signup";

const inputClass = "border border-gray-200 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand";

export default function PartnerRegisterForm({ countries, defaultEmail }: { countries: { code: string; name: string }[]; defaultEmail: string }) {
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(countries[0]?.code ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await registerCompany({ name, contactEmail, phone, country });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Company name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Contact email</label>
        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className={inputClass} />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputClass} />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Country</label>
        <select value={country} onChange={(e) => setCountry(e.target.value)} required className={`${inputClass} bg-white`}>
          {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <button disabled={isPending} className="w-full bg-brand hover:bg-brand-dark text-white font-semibold text-sm py-3.5 rounded-full transition-colors disabled:opacity-50">
        {isPending ? "Submitting..." : "Submit for review"}
      </button>
    </form>
  );
}