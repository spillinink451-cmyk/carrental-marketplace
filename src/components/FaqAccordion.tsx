"use client";

import { useState } from "react";

const FAQS = [
  { q: "Can I cancel my booking?", a: "Yes — every booking includes free cancellation up until 48 hours before your pickup time. After that window, the deposit becomes non-refundable." },
  { q: "How does the deposit work?", a: "You pay a small deposit online to confirm your booking. The remaining balance is paid directly to the rental company at pickup." },
  { q: "Does the price include insurance?", a: "Insurance terms are set by each individual rental company and shown on the car's page before you book. Always confirm coverage with the company at pickup." },
  { q: "What do I need to bring as a driver?", a: "A valid CNIC or passport and a valid driving licence. Some companies may have minimum age requirements — check the car listing for details." },
  { q: "What payment methods are accepted?", a: "We're currently finalising local payment options. Reach out to support for the latest available methods." },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <h2 className="text-slate-800 font-bold text-[32px] sm:text-[38px] text-center mb-12">
        Frequently asked questions
      </h2>
      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={faq.q} className="border border-gray-200 rounded-[20px] overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left">
              <span className="font-semibold text-slate-800">{faq.q}</span>
              <span className={`text-slate-400 text-xl transition-transform duration-200 ${open === i ? "rotate-45" : ""}`}>+</span>
            </button>
            <div className={`grid transition-all duration-200 ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-slate-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}