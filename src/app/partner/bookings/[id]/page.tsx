import { requireBookingForCompany } from "@/lib/partner-auth";
import { getHandoverChecks } from "@/db/queries";
import HandoverForm from "@/components/HandoverForm";
import BookingApprovalActions from "@/components/BookingApprovalActions";
import PartnerNav from "@/components/PartnerNav";
import { getLeaseByBookingId } from "@/db/queries";
import Link from "next/link";

const statusStyles: Record<string, string> = {
  pending: "text-amber-700 bg-amber-50",
  confirmed: "text-emerald-600 bg-emerald-50",
  active: "text-blue-600 bg-blue-50",
  completed: "text-slate-600 bg-slate-100",
  cancelled: "text-red-600 bg-red-50",
  disputed: "text-red-600 bg-red-50",
};

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
    <main className="max-w-2xl mx-auto px-6 py-12">
      <PartnerNav />

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Booking detail</h1>
        <span className={`text-xs uppercase font-semibold px-2.5 py-1 rounded-full ${statusStyles[booking.status] ?? "text-slate-600 bg-slate-100"}`}>
          {booking.status}
        </span>
      </div>

      {booking.status === "pending" && <BookingApprovalActions bookingId={id} />}

      <div className="bg-white border border-gray-200 rounded-[20px] p-5 mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Driver details</h2>
        <div className="text-sm space-y-1 text-slate-700">
          <p><span className="text-slate-400">Name:</span> {booking.driverName}</p>
          <p><span className="text-slate-400">Phone:</span> {booking.driverPhone}</p>
          <p><span className="text-slate-400">National ID:</span> {booking.driverCnic}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-slate-800 mb-3">Pickup handover</h2>
          {pickupCheck ? (
            <div className="bg-white border border-gray-200 rounded-[20px] p-4 text-sm space-y-1">
              <p className="text-slate-700">Fuel: {pickupCheck.fuelLevel}%</p>
              <p className="text-slate-700">Odometer: {pickupCheck.odometerKm} km</p>
              <div className="flex gap-2 mt-2">
                {pickupCheck.photos.map((url) => (
                  <img key={url} src={url} className="w-14 h-14 rounded-lg object-cover" />
                ))}
              </div>
            </div>
          ) : (
            <HandoverForm bookingId={id} type="pickup" />
          )}

          {lease && (
  <div className="bg-white border border-gray-200 rounded-[20px] p-5 mb-6 flex justify-between items-center">
    <div>
      <h2 className="font-semibold text-slate-800">Lease agreement</h2>
      <p className="text-sm text-slate-500 capitalize">Status: {lease.status}</p>
    </div>
    <Link href={`/partner/leases/${lease.id}`} className="text-brand text-sm font-medium hover:underline">View / sign</Link>
  </div>
)}

        </div>

        <div>
          <h2 className="font-semibold text-slate-800 mb-3">Drop-off handover</h2>
          {dropoffCheck ? (
            <div className="bg-white border border-gray-200 rounded-[20px] p-4 text-sm space-y-1">
              <p className="text-slate-700">Fuel: {dropoffCheck.fuelLevel}%</p>
              <p className="text-slate-700">Odometer: {dropoffCheck.odometerKm} km</p>
              <div className="flex gap-2 mt-2">
                {dropoffCheck.photos.map((url) => (
                  <img key={url} src={url} className="w-14 h-14 rounded-lg object-cover" />
                ))}
              </div>
            </div>
          ) : pickupCheck ? (
            <HandoverForm bookingId={id} type="dropoff" />
          ) : (
            <p className="text-slate-400 text-sm">Record pickup first.</p>
          )}
        </div>
      </div>
    </main>
  );
}