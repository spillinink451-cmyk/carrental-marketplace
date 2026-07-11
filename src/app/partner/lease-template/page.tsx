import { requireCompanyOwner } from "@/lib/partner-auth";
import { getLeaseTemplateForCompany } from "@/db/queries";
import PartnerNav from "@/components/PartnerNav";
import LeaseTemplateForm from "@/components/LeaseTemplateForm";

export default async function LeaseTemplatePage() {
  const ctx = await requireCompanyOwner();
  const template = await getLeaseTemplateForCompany(ctx.companyId);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <PartnerNav />
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Lease template</h1>
      <p className="text-slate-500 text-sm mb-8">
        These default terms are used every time a new lease is created for your company — both from confirmed bookings and standalone leases.
      </p>
      <div className="bg-white border border-gray-200 rounded-[20px] p-6">
        <LeaseTemplateForm existing={template} />
      </div>
    </main>
  );
}