import { auth } from "@/auth";
import { getBookingById, getLeaseByBookingId } from "@/db/queries";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate, formatDateTime } from "@/lib/datetime";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const booking = await getBookingById(id);

  if (!booking) notFound();
  if (booking.userId !== session.user.id) notFound();
  const lease = await getLeaseByBookingId(booking.id);

  const total =
    Number(booking.depositAmount) + Number(booking.remainingAmount) + Number(booking.platformFee);

  const statusStyles: Record<string, string> = {
    pending: "text-amber-700 bg-amber-50",
    confirmed: "text-emerald-600 bg-emerald-50",
    active: "text-blue-600 bg-blue-50",
    completed: "text-slate-600 bg-slate-100",
    cancelled: "text-red-600 bg-red-50",
    disputed: "text-red-600 bg-red-50",
  };

  return (
    <main className="max-w-lg mx-auto px-6 pt-28 pb-16">
      <div className="border border-gray-200 rounded-[20px] p-6 bg-white shadow-sm">
        <span
          className={`text-xs uppercase tracking-wide px-2.5 py-1 rounded-full font-semibold ${
            statusStyles[booking.status] ?? "text-slate-600 bg-slate-100"
          }`}
        >
          {booking.status}
        </span>

        {booking.status === "pending" && (
          <p className="text-sm text-amber-700 mt-2">
            Waiting for {booking.companyName} to confirm your booking.
          </p>
        )}
        {booking.status === "cancelled" && booking.rejectionReason && (
          <p className="text-sm text-red-600 mt-2">
            This booking was declined: {booking.rejectionReason}
          </p>
        )}

        <h1 className="text-2xl font-bold text-slate-800 mt-3 mb-1">
          {booking.carBrand} {booking.carModel}
        </h1>
        <p className="text-slate-500 mb-6">
          {booking.companyName} · {booking.locationAddress}, {booking.locationCity}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <span className="text-slate-400 text-xs block">Pickup</span>
            {formatDateTime(booking.pickupAt, booking.timezone)}
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Drop-off</span>
            {formatDateTime(booking.dropoffAt, booking.timezone)}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Driver details
          </h2>
          <div className="text-sm space-y-1">
            <p><span className="text-slate-400">Name:</span> {booking.driverName}</p>
            <p><span className="text-slate-400">Phone:</span> {booking.driverPhone}</p>
            <p><span className="text-slate-400">{booking.idDocumentLabel}:</span> {booking.driverCnic}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Deposit paid</span>
            <span>{formatCurrency(booking.depositAmount, booking.currency)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Pay at pickup</span>
            <span>{formatCurrency(booking.remainingAmount, booking.currency)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Platform service fee</span>
            <span>{formatCurrency(booking.platformFee, booking.currency)}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-800 border-t border-gray-100 pt-2">
            <span>Total</span>
            <span>{formatCurrency(total, booking.currency)}</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          Free cancellation until {new Date(booking.cancellationDeadline).toLocaleString()}
        </p>

        <Link href={`/bookings/${booking.id}/dispute`} className="text-sm text-red-500 underline block mt-4">
          Report an issue with this booking
        </Link>
        {lease && (
          <Link href={`/leases/${lease.id}`} className="block bg-amber-50 text-amber-800 text-sm font-medium rounded-lg px-4 py-3 mt-4 hover:bg-amber-100 transition-colors">
            {lease.status === "active" ? "View your signed lease agreement →" : "Sign your lease agreement →"}
          </Link>
        )}
      </div>
    </main>
  );
}