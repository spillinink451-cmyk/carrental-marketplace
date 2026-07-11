import { requireBranchAccess } from "@/lib/partner-auth";
import { getLeaseById } from "@/db/queries";
import { notFound } from "next/navigation";
import { decrypt } from "@/lib/encryption";
import SignAndSubmit from "@/components/SignAndSubmit";
import { signLeaseAsCompany, captureWalkInCustomerSignature } from "@/app/actions/leases";
import PartnerNav from "@/components/PartnerNav";
import { formatCurrency } from "@/lib/currency";
import { formatDate, formatDateTime } from "@/lib/datetime";

export default async function PartnerLeasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lease = await getLeaseById(id);
  if (!lease) notFound();
  await requireBranchAccess(lease.branchId);

  const cnic = decrypt(lease.lesseeCnicEncrypted);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <PartnerNav />
      <div className="bg-white border border-gray-200 rounded-[20px] p-6">
        <span className="text-xs uppercase font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 capitalize">{lease.status}</span>
        <h1 className="text-2xl font-bold text-slate-800 mt-3 mb-1">Lease Agreement</h1>
        <p className="text-slate-500 mb-6">{lease.carSnapshot} · {lease.lesseeName}</p>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div><span className="text-slate-400 block text-xs">Start</span>{formatDate(lease.startDate, lease.timezone)}</div>
          <div><span className="text-slate-400 block text-xs">End</span>{formatDate(lease.endDate, lease.timezone)}</div>
          <div><span className="text-slate-400 block text-xs">Total</span>{formatCurrency(lease.totalAmount, lease.currency)}</div>
          <div><span className="text-slate-400 block text-xs">Deposit</span>{formatCurrency(lease.depositAmount, lease.currency)}</div>
        </div>

        <div className="border-t border-gray-100 pt-4 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Lessee</h2>
          <p className="text-sm text-slate-700">{lease.lesseeName} · {lease.lesseePhone} · {lease.idDocumentLabel}: {cnic}</p>
          {!lease.lesseeUserId && <p className="text-xs text-amber-600 mt-1">Walk-in — no platform account linked.</p>}
        </div>

        <div className="border-t border-gray-100 pt-4 mb-6">
          <h2 className="font-semibold text-slate-800 mb-3">Company signature</h2>
          {lease.companySignatureUrl ? (
            <p className="text-sm text-emerald-600">✓ Company signed on ${formatDateTime(lease.companySignedAt!, lease.timezone)}</p>
          ) : (
            <SignAndSubmit leaseId={lease.id} label="Company representative signature" onSign={signLeaseAsCompany} />
          )}
        </div>

        <div className="border-t border-gray-100 pt-4 mb-6">
          <h2 className="font-semibold text-slate-800 mb-3">Customer signature</h2>
          {lease.customerSignatureUrl ? (
            <p className="text-sm text-emerald-600">✓ Signed on {formatDateTime(lease.customerSignedAt!, lease.timezone)}</p>
          ) : lease.lesseeUserId ? (
            <p className="text-sm text-slate-400">Waiting for the customer to sign from their own account.</p>
          ) : (
            <SignAndSubmit leaseId={lease.id} label="Capture customer's signature (in person)" onSign={captureWalkInCustomerSignature} />
          )}
        </div>

        {lease.status === "active" && (
          <a href={`/api/leases/${lease.id}/pdf`} className="text-brand text-sm font-medium underline">Download signed PDF</a>
        )}
      </div>
    </main>
  );
}