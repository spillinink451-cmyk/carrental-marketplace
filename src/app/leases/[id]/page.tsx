import { auth } from "@/auth";
import { getLeaseById } from "@/db/queries";
import { notFound, redirect } from "next/navigation";
import { decrypt } from "@/lib/encryption";
import SignAndSubmit from "@/components/SignAndSubmit";
import { signLeaseAsCustomer } from "@/app/actions/leases";

export default async function CustomerLeasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/leases/${id}`);

  const lease = await getLeaseById(id);
  if (!lease) notFound();
  if (lease.lesseeUserId !== session.user.id) notFound();

  const cnic = decrypt(lease.lesseeCnicEncrypted);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-white border border-gray-200 rounded-[20px] p-6">
        <span className="text-xs uppercase font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 capitalize">{lease.status}</span>
        <h1 className="text-2xl font-bold text-slate-800 mt-3 mb-1">Lease Agreement</h1>
        <p className="text-slate-500 mb-6">{lease.carSnapshot} · {lease.companyNameSnapshot}</p>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div><span className="text-slate-400 block text-xs">Start</span>{new Date(lease.startDate).toLocaleDateString()}</div>
          <div><span className="text-slate-400 block text-xs">End</span>{new Date(lease.endDate).toLocaleDateString()}</div>
          <div><span className="text-slate-400 block text-xs">Total</span>{lease.totalAmount}</div>
          <div><span className="text-slate-400 block text-xs">Deposit</span>{lease.depositAmount}</div>
        </div>

        <div className="border-t border-gray-100 pt-4 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Your details</h2>
          <p className="text-sm text-slate-700">{lease.lesseeName} · {lease.lesseePhone} · {cnic}</p>
        </div>

        <div className="border-t border-gray-100 pt-4 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Terms & Conditions</h2>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{lease.termsAndConditions}</p>
        </div>

        <div className="border-t border-gray-100 pt-4 mb-4">
          <h2 className="font-semibold text-slate-800 mb-3">Your signature</h2>
          {lease.customerSignatureUrl ? (
            <p className="text-sm text-emerald-600">✓ Signed on {new Date(lease.customerSignedAt!).toLocaleString()}</p>
          ) : (
            <SignAndSubmit leaseId={lease.id} label="Sign here to accept the lease" onSign={signLeaseAsCustomer} />
          )}
        </div>

        <p className="text-sm text-slate-400 mb-4">
          {lease.companySignatureUrl ? `✓ Company signed on ${new Date(lease.companySignedAt!).toLocaleString()}` : "Waiting for company signature."}
        </p>

        {lease.status === "active" && (
          <a href={`/api/leases/${lease.id}/pdf`} className="text-brand text-sm font-medium underline">Download signed PDF</a>
        )}
      </div>
    </main>
  );
}