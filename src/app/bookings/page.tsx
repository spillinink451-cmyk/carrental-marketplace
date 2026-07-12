import { auth } from "@/auth";
import { getBookingsForUser } from "@/db/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/datetime";

const statusStyles: Record<string, string> = {
  pending: "text-amber-700 bg-amber-50",
  confirmed: "text-emerald-600 bg-emerald-50",
  active: "text-blue-600 bg-blue-50",
  completed: "text-slate-600 bg-slate-100",
  cancelled: "text-red-600 bg-red-50",
  disputed: "text-red-600 bg-red-50",
};

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/bookings");

  const bookingsList = await getBookingsForUser(session.user.id);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">My bookings</h1>
      <p className="text-slate-500 text-sm mb-8">
        {bookingsList.length} booking{bookingsList.length === 1 ? "" : "s"}
      </p>

      <div className="space-y-3">
        {bookingsList.map((b) => (
          <Link
            key={b.id}
            href={`/bookings/${b.id}`}
            className="block bg-white border border-gray-200 rounded-[20px] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-slate-800">{b.carBrand} {b.carModel}</span>
              <span className={`text-xs uppercase font-semibold px-2.5 py-1 rounded-full ${statusStyles[b.status] ?? "text-slate-600 bg-slate-100"}`}>
                {b.status}
              </span>
            </div>
            <p className="text-slate-500 text-sm">{b.companyName}</p>
            <p className="text-slate-400 text-xs mt-1">
              // replace with:
{formatDate(b.pickupAt, b.timezone)} → {formatDate(b.dropoffAt, b.timezone)}
            </p>
          </Link>
        ))}

        {bookingsList.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-[20px]">
            <p className="text-slate-400 mb-4">You haven&apos;t booked a car yet.</p>
            <Link href="/" className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
              Browse cars
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}