import { requireCompanyOwner } from "@/lib/partner-auth";
import { getBranchesForCompany, getBranchAdmins, getCountries } from "@/db/queries";
import CreateBranchForm from "@/components/CreateBranchForm";
import AssignBranchAdminForm from "@/components/AssignBranchAdminForm";
import PartnerNav from "@/components/PartnerNav";
import Link from "next/link";

export default async function BranchesPage() {
  const ctx = await requireCompanyOwner();
  const [branchList, admins, countryList] = await Promise.all([
    getBranchesForCompany(ctx.companyId),
    getBranchAdmins(ctx.companyId),
    getCountries(),
  ]);

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <PartnerNav />
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Branches</h1>
      <p className="text-slate-500 text-sm mb-8">{branchList.length} branch{branchList.length === 1 ? "" : "es"}</p>

      <div className="bg-white border border-gray-200 rounded-[20px] p-6 mb-8">
        <h2 className="font-semibold text-slate-800 mb-4">Add a branch</h2>
        <CreateBranchForm countries={countryList} />
      </div>

      <div className="space-y-4">
        {branchList.map((b) => {
          const admin = admins.find((a) => a.branchId === b.id);
          return (
            <div key={b.id} className="bg-white border border-gray-200 rounded-[20px] p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-slate-800">{b.name}</p>
                  <p className="text-slate-500 text-sm">{b.area ? `${b.area}, ` : ""}{b.city}</p>
                </div>
                <Link href={`/partner/branches/${b.id}/staff`} className="text-brand text-sm font-medium hover:underline">
                  Manage staff
                </Link>
              </div>
              {admin ? (
                <p className="text-xs text-slate-500">Branch admin: <span className="font-medium text-slate-700">{admin.userName ?? admin.userEmail}</span></p>
              ) : (
                <AssignBranchAdminForm branchId={b.id} />
              )}
            </div>
          );
        })}
        {branchList.length === 0 && <p className="text-slate-400 text-sm">No branches yet.</p>}
      </div>
    </main>
  );
}