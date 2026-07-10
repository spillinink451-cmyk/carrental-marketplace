import NewCarForm from "@/components/NewCarForm";
import PartnerNav from "@/components/PartnerNav";
import { requirePartnerCompany } from "@/lib/partner-auth";
import { getBranchesForCompany, getBrandsWithModels, getCarCategories } from "@/db/queries";

export default async function NewCarPage() {
  const ctx = await requirePartnerCompany();
  const [allBranches, brands, categories] = await Promise.all([
    getBranchesForCompany(ctx.companyId),
    getBrandsWithModels(),
    getCarCategories(),
  ]);
  const accessibleBranches = ctx.role === "owner" ? allBranches : allBranches.filter((b) => b.id === ctx.branchId);

  return (
    <main className="max-w-lg mx-auto px-6 py-12">
      <PartnerNav />
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Add a new car</h1>
      <p className="text-slate-500 text-sm mb-8">List a car for customers to book.</p>
      <div className="bg-white border border-gray-200 rounded-[20px] p-6">
        <NewCarForm branches={accessibleBranches} brands={brands} categories={categories} />
      </div>
    </main>
  );
}