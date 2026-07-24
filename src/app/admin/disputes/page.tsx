import { requireAdmin } from "@/lib/admin-auth";
import { getAllDisputesForAdmin } from "@/db/queries";
import AdminNav from "@/components/AdminNav";
import DisputeResolutionCard from "@/components/DisputeResolutionCard";

const statusStyles: Record<string, string> = {
  open: "text-amber-700 bg-amber-50",
  under_review: "text-blue-600 bg-blue-50",
  resolved: "text-emerald-600 bg-emerald-50",
  rejected: "text-slate-600 bg-slate-100",
};

export default async function AdminDisputesPage() {
  await requireAdmin();
  const disputeList = await getAllDisputesForAdmin();

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <AdminNav />
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Disputes</h1>
      <p className="text-slate-500 text-sm mb-8">{disputeList.length} total, sorted with open disputes first</p>

      <div className="space-y-4">
        {disputeList.map((d) => (
          <DisputeResolutionCard key={d.id} dispute={d} statusStyle={statusStyles[d.status] ?? "text-slate-600 bg-slate-100"} />
        ))}
        {disputeList.length === 0 && <p className="text-slate-400 text-sm">No disputes.</p>}
      </div>
    </main>
  );
}