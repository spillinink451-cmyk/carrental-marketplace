import { requireBookingForCompany } from "@/lib/partner-auth";
import { getHandoverChecks, getLeaseByBookingId } from "@/db/queries";
import HandoverForm from "@/components/HandoverForm";
import BookingApprovalActions from "@/components/BookingApprovalActions";
import PartnerNav from "@/components/PartnerNav";
import Link from "next/link";
import { User, Phone, IdCard, Globe2, MapPin, FileText, Fuel, Gauge, ArrowRight } from "lucide-react";

const statusStyles: Record<string, string> = {
  pending: "text-amber-700 bg-amber-50",
  confirmed: "text-emerald-600 bg-emerald-50",
  active: "text-blue-600 bg-blue-50",
  completed: "text-slate-600 bg-slate-100",
  cancelled: "text-red-600 bg-red-50",
  disputed: "text-red-600 bg-red-50",
};

const leaseStatusStyles: Record<string, string> = {
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

export default async function PartnerBookingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await requireBookingForCompany(id);
  const checks = await getHandoverChecks(id);
  const lease = await getLeaseByBookingId(id);

  const pickupCheck = checks.find((c) => c.type === "pickup");
  const dropoffCheck = checks.find((c) => c.type === "dropoff");

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <PartnerNav />

      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Booking detail</h1>
        <span className={`text-xs uppercase font-semibold px-2.5 py-1 rounded-full ${statusStyles[booking.status] ?? "text-slate-600 bg-slate-100"}`}>
          {booking.status}
        </span>
      </div>

      {booking.status === "pending" && <BookingApprovalActions bookingId={id} />}

      {lease && (
        <div className="bg-white border border-gray-200 rounded-[20px] p-5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Lease agreement</p>
              <span className={`text-xs uppercase font-semibold px-2 py-0.5 rounded-full ${leaseStatusStyles[lease.status] ?? "text-slate-600 bg-slate-100"}`}>
                {lease.status}
              </span>
            </div>
          </div>
          <Link href={`/partner/leases/${lease.id}`} className="flex items-center gap-1 text-brand text-sm font-semibold hover:underline">
            View / sign <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-[20px] p-6 mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">Driver &amp; License Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <DetailRow icon={User} label="Name" value={booking.driverName} />
          <DetailRow icon={Phone} label="Phone" value={booking.driverPhone} />
          <DetailRow icon={IdCard} label="National ID" value={booking.driverCnic} />
          <DetailRow icon={Globe2} label="Nationality" value={booking.driverNationality || ""} />
          <DetailRow icon={MapPin} label="Address" value={booking.driverAddress || ""} /> 
          <DetailRow icon={FileText} label="License type" value={booking.driverLicenseType || ""} />
          <DetailRow icon={FileText} label="License no." value={booking.driverLicenseNo || ""} />

          <DetailRow
            icon={FileText}
            label="License issued"
            value={booking.driverLicenseIssueDate ? new Date(booking.driverLicenseIssueDate).toLocaleDateString() : ""}
          />
        </div>
      </div>

      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Handover Records</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <p className="text-sm font-semibold text-slate-800 mb-3">Pickup</p>
          {pickupCheck ? (
            <div className="bg-white border border-gray-200 rounded-[20px] p-4">
              <div className="flex gap-4 text-sm mb-3">
                <span className="flex items-center gap-1.5 text-slate-600"><Fuel className="w-4 h-4 text-slate-400" /> {pickupCheck.fuelLevel}%</span>
                <span className="flex items-center gap-1.5 text-slate-600"><Gauge className="w-4 h-4 text-slate-400" /> {pickupCheck.odometerKm} km</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {pickupCheck.photos.map((url) => (
                  <img key={url} src={url} className="w-14 h-14 rounded-lg object-cover border border-gray-100" />
                ))}
              </div>
            </div>
          ) : (
            <HandoverForm bookingId={id} type="pickup" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800 mb-3">Drop-off</p>
          {dropoffCheck ? (
            <div className="bg-white border border-gray-200 rounded-[20px] p-4">
              <div className="flex gap-4 text-sm mb-3">
                <span className="flex items-center gap-1.5 text-slate-600"><Fuel className="w-4 h-4 text-slate-400" /> {dropoffCheck.fuelLevel}%</span>
                <span className="flex items-center gap-1.5 text-slate-600"><Gauge className="w-4 h-4 text-slate-400" /> {dropoffCheck.odometerKm} km</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {dropoffCheck.photos.map((url) => (
                  <img key={url} src={url} className="w-14 h-14 rounded-lg object-cover border border-gray-100" />
                ))}
              </div>
            </div>
          ) : pickupCheck ? (
            <HandoverForm bookingId={id} type="dropoff" />
          ) : (
            <div className="bg-slate-50 border border-dashed border-gray-200 rounded-[20px] p-4 text-sm text-slate-400">
              Record pickup first.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}