import { requireAdmin } from "@/lib/admin-auth";
import { getAdminDashboardStats, getPendingCompaniesForAdmin } from "@/db/queries";
import AdminNav from "@/components/AdminNav";
import Link from "next/link";
import { Building2, Car, CalendarCheck, AlertTriangle, FileText, ArrowRight } from "lucide-react";

function StatCard({ icon: Icon, label, value, tone = "brand" }: { icon: any; label: string; value: number; tone?: "brand" | "amber" | "red" }) {
  const toneClasses = {
    brand: "bg-brand/10 text-brand",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  }[tone];
  return (
    <div className="bg-white border border-gray-200 rounded-[20px] p-5">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${toneClasses}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  await requireAdmin();
  const [stats, pendingCompanies] = await Promise.all([
    getAdminDashboardStats(),
    getPendingCompaniesForAdmin(),
  ]);

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <AdminNav />
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Platform overview</h1>
      <p className="text-slate-500 text-sm mb-8">A snapshot of everything running on Waypoint right now.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <StatCard icon={Building2} label="Active companies" value={stats.companies.active} />
        <StatCard icon={Car} label="Cars listed" value={stats.cars} />
        <StatCard icon={CalendarCheck} label="Total bookings" value={stats.bookings} />
        <StatCard icon={FileText} label="Lease agreements" value={stats.leases} />
        <StatCard icon={Building2} label="Pending companies" value={stats.companies.pending} tone="amber" />
        <StatCard icon={AlertTriangle} label="Open disputes" value={stats.openDisputes} tone="red" />
      </div>

      {pendingCompanies.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-[20px] p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-amber-800">{pendingCompanies.length} compan{pendingCompanies.length === 1 ? "y" : "ies"} awaiting review</p>
            <Link href="/admin/companies" className="flex items-center gap-1 text-amber-700 text-sm font-semibold hover:underline">
              Review now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-1">
            {pendingCompanies.slice(0, 4).map((c) => (
              <p key={c.id} className="text-sm text-amber-700">{c.name} — {c.contactEmail}</p>
            ))}
            {pendingCompanies.length > 4 && <p className="text-xs text-amber-600">+{pendingCompanies.length - 4} more</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/companies" className="bg-white border border-gray-200 rounded-[20px] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800">Manage companies</p>
            <p className="text-sm text-slate-500">Approve, suspend, and review partners</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300" />
        </Link>
        <Link href="/admin/disputes" className="bg-white border border-gray-200 rounded-[20px] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800">Resolve disputes</p>
            <p className="text-sm text-slate-500">{stats.openDisputes} awaiting a decision</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300" />
        </Link>
      </div>
    </main>
  );
}