// src/app/partner/leases/new/page.tsx
import { requirePartnerCompany } from "@/lib/partner-auth";
import { getCarsForBranchSimple, getCarsByCompany } from "@/db/queries";
import PartnerNav from "@/components/PartnerNav";
import NewLeaseForm from "@/components/NewLeaseForm";

export default async function NewLeasePage() {
  const ctx = await requirePartnerCompany();
  const carsList = ctx.role === "owner" ? await getCarsByCompany(ctx.companyId) : await getCarsForBranchSimple(ctx.branchId!);

  return (
    <main className="max-w-lg mx-auto px-6 py-12">
      <PartnerNav />
      <h1 className="text-2xl font-bold text-slate-800 mb-1">New lease agreement</h1>
      <p className="text-slate-500 text-sm mb-8">Create a lease directly, with or without a prior booking.</p>
      <div className="bg-white border border-gray-200 rounded-[20px] p-6">
        <NewLeaseForm cars={carsList} />
      </div>
    </main>
  );
}