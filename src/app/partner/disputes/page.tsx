import { requirePartnerCompany } from "@/lib/partner-auth";
import { getDisputesForCompany } from "@/db/queries";
import PartnerNav from "@/components/PartnerNav";

const statusStyles: Record<string, string> = {
  open: "text-amber-700 bg-amber-50",
  under_review: "text-blue-600 bg-blue-50",
  resolved: "text-emerald-600 bg-emerald-50",
  rejected: "text-slate-600 bg-slate-100",
};

export default async function PartnerDisputesPage() {
  const { companyId } = await requirePartnerCompany();
  const disputeList = await getDisputesForCompany(companyId);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <PartnerNav />
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Disputes</h1>
      <p className="text-slate-500 text-sm mb-8">{disputeList.length} total</p>

      <div className="space-y-3">
        {disputeList.map((d) => (
          <div key={d.id} className="bg-white border border-gray-200 rounded-[20px] p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-slate-800 capitalize">{d.type.replace("_", " ")}</span>
              <span className={`text-xs uppercase font-semibold px-2.5 py-1 rounded-full ${statusStyles[d.status] ?? "text-slate-600 bg-slate-100"}`}>
                {d.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-slate-500 text-sm mb-2">{d.carBrand} {d.carModel}</p>
            <p className="text-slate-700 text-sm">{d.description}</p>
          </div>
        ))}
        {disputeList.length === 0 && (
          <p className="text-slate-400 text-sm">No disputes.</p>
        )}
      </div>
    </main>
  );
}