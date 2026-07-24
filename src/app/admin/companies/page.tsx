import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { approveCompany, suspendCompany } from "@/app/actions/admin";
import AdminNav from "@/components/AdminNav";

const statusStyles: Record<string, string> = {
  pending: "text-amber-700 bg-amber-50",
  active: "text-emerald-600 bg-emerald-50",
  suspended: "text-red-600 bg-red-50",
};

export default async function AdminCompaniesPage() {
  await requireAdmin();
  const allCompanies = await db.select().from(companies);
  const sorted = [...allCompanies].sort((a, b) => (a.status === "pending" ? -1 : b.status === "pending" ? 1 : 0));

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <AdminNav />
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Companies</h1>
      <p className="text-slate-500 text-sm mb-8">{allCompanies.length} total &middot; {allCompanies.filter((c) => c.status === "pending").length} pending review</p>

      <div className="space-y-3">
        {sorted.map((c) => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-[20px] p-5 flex justify-between items-center">
            <div>
              <div className="font-semibold text-slate-800">{c.name}</div>
              <div className="text-sm text-slate-500">{c.contactEmail} &middot; {c.phone}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs uppercase font-semibold px-2.5 py-1 rounded-full ${statusStyles[c.status]}`}>{c.status}</span>
                <span className="text-xs text-slate-400">{c.country} &middot; {c.currency} &middot; {c.commissionRate}% commission</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {c.status !== "active" && (
                <form action={approveCompany.bind(null, c.id)}>
                  <button className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">Approve</button>
                </form>
              )}
              {c.status !== "suspended" && (
                <form action={suspendCompany.bind(null, c.id)}>
                  <button className="bg-white border border-gray-200 text-slate-600 text-sm font-semibold px-4 py-2 rounded-full hover:border-red-300 hover:text-red-600 transition-colors">Suspend</button>
                </form>
              )}
            </div>
          </div>
        ))}
        {allCompanies.length === 0 && <p className="text-slate-400 text-sm">No companies yet.</p>}
      </div>
    </main>
  );
}