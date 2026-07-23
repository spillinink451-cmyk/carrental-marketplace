import { requireBranchAccess } from "@/lib/partner-auth";
import { getLeaseById } from "@/db/queries";
import { notFound } from "next/navigation";
import { decrypt } from "@/lib/encryption";
import SignAndSubmit from "@/components/SignAndSubmit";
import { signLeaseAsCompany, captureWalkInCustomerSignature } from "@/app/actions/leases";
import PartnerNav from "@/components/PartnerNav";
import LeaseDetailsForm from "@/components/LeaseDetailsForm";
import { formatCurrency } from "@/lib/currency";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { User, Phone, IdCard, Globe2, MapPin, Briefcase, FileText, CheckCircle2, Clock, Download, ArrowRight } from "lucide-react";
import Link from "next/link";

export const maxDuration = 30;

const statusStyles: Record<string, string> = {
  draft: "text-amber-700 bg-amber-50",
  active: "text-emerald-600 bg-emerald-50",
  completed: "text-slate-600 bg-slate-100",
  terminated: "text-red-600 bg-red-50",
  cancelled: "text-red-600 bg-red-50",
};

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{label}</p>
        <p className="text-sm text-slate-700 font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}

export default async function PartnerLeasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lease = await getLeaseById(id);
  if (!lease) notFound();
  await requireBranchAccess(lease.branchId);

  const cnic = decrypt(lease.lesseeCnicEncrypted);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <PartnerNav />
      <div className="bg-white border border-gray-200 rounded-[20px] overflow-hidden shadow-sm">
        <div className="bg-gradient-to-br from-brand to-slate-800 px-6 py-6 text-white">
          <span className={`text-xs uppercase font-semibold px-2.5 py-1 rounded-full ${statusStyles[lease.status] ?? "bg-white/20"}`}>
            {lease.status}
          </span>
          <h1 className="text-2xl font-bold mt-3 mb-1">{lease.carSnapshot}</h1>
          <p className="text-white/80 text-sm">{lease.lesseeName}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-8">
            <div><span className="text-slate-400 block text-xs">Start</span>{formatDate(lease.startDate, lease.timezone)}</div>
            <div><span className="text-slate-400 block text-xs">End</span>{formatDate(lease.endDate, lease.timezone)}</div>
            <div><span className="text-slate-400 block text-xs">Total</span>{formatCurrency(lease.totalAmount, lease.currency)}</div>
            <div><span className="text-slate-400 block text-xs">Deposit</span>{formatCurrency(lease.depositAmount, lease.currency)}</div>
          </div>

          {!lease.lesseeUserId && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-4 inline-block">Walk-in — no platform account linked.</p>
          )}
          {lease.bookingId && (
            <Link href={`/partner/bookings/${lease.bookingId}`} className="flex items-center gap-1 text-brand text-xs font-semibold hover:underline mb-6">
              View linked booking <ArrowRight className="w-3 h-3" />
            </Link>
          )}

          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">Lessee Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <DetailRow icon={User} label="Name" value={lease.lesseeName} />
            <DetailRow icon={Phone} label="Phone" value={lease.lesseePhone} />
            <DetailRow icon={IdCard} label={lease.idDocumentLabel} value={cnic} />
            <DetailRow icon={Globe2} label="Nationality" value={lease.lesseeNationality ?? ""} />
            <DetailRow icon={MapPin} label="Address" value={lease.lesseeAddress ?? ""} />
            <DetailRow icon={Briefcase} label="Work address" value={lease.lesseeWorkAddress ?? ""} />
            <DetailRow icon={Briefcase} label="Work phone" value={lease.lesseeWorkPhone ?? ""} />
            <DetailRow icon={FileText} label="License type" value={lease.licenseType ?? ""} />
            <DetailRow icon={FileText} label="License no." value={lease.drivingLicenseNo ?? ""} />
          </div>

          <div className="border-t border-gray-100 pt-6 mb-8">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Vehicle Handover Details</h2>
            <LeaseDetailsForm lease={lease} />
          </div>

          <details className="border-t border-gray-100 pt-4 mb-6">
            <summary className="cursor-pointer text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand" /> Terms &amp; Conditions
            </summary>
            <div className="mt-3 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{lease.termsAndConditions}</div>
            {lease.termsAndConditionsAr && (
              <div dir="rtl" className="font-arabic text-sm text-slate-600 whitespace-pre-wrap mt-4 pt-4 border-t border-gray-100 text-right leading-relaxed">
                {lease.termsAndConditionsAr}
              </div>
            )}
          </details>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className={`rounded-xl p-4 border ${lease.companySignatureUrl ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                {lease.companySignatureUrl ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                <span className="text-sm font-semibold text-slate-800">Company signature</span>
              </div>
              {lease.companySignatureUrl ? (
                <p className="text-xs text-emerald-700">Signed {formatDateTime(lease.companySignedAt!, lease.timezone)}</p>
              ) : (
                <div className="mt-2"><SignAndSubmit leaseId={lease.id} label="Company representative signature" onSign={signLeaseAsCompany} /></div>
              )}
            </div>
            <div className={`rounded-xl p-4 border ${lease.customerSignatureUrl ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                {lease.customerSignatureUrl ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                <span className="text-sm font-semibold text-slate-800">Customer signature</span>
              </div>
              {lease.customerSignatureUrl ? (
                <p className="text-xs text-emerald-700">Signed {formatDateTime(lease.customerSignedAt!, lease.timezone)}</p>
              ) : lease.lesseeUserId ? (
                <p className="text-xs text-slate-400 mt-1">Waiting for customer to sign from their account.</p>
              ) : (
                <div className="mt-2"><SignAndSubmit leaseId={lease.id} label="Capture customer's signature" onSign={captureWalkInCustomerSignature} /></div>
              )}
            </div>
          </div>

          {lease.status === "active" && (
            <a href={`/api/leases/${lease.id}/pdf`} className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold text-sm py-3 rounded-full transition-colors">
              <Download className="w-4 h-4" /> Download signed PDF
            </a>
          )}
        </div>
      </div>
    </main>
  );
}