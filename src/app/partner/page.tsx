import { requirePartnerCompany } from "@/lib/partner-auth";
import { getCarsByCompany, getBookingsByCompany, getCarsByBranch, getBookingsByBranch } from "@/db/queries";
import Link from "next/link";
import PartnerNav from "@/components/PartnerNav";
import { formatDate } from "@/lib/datetime";

const statusStyles: Record<string, string> = {
  pending: "text-amber-700 bg-amber-50",
  confirmed: "text-emerald-600 bg-emerald-50",
  active: "text-blue-600 bg-blue-50",
  completed: "text-slate-600 bg-slate-100",
  cancelled: "text-red-600 bg-red-50",
  disputed: "text-red-600 bg-red-50",
};

export default async function PartnerDashboard({ searchParams }: { searchParams?: { welcome?: string } }) {
  const ctx = await requirePartnerCompany();
  const isOwner = ctx.role === "owner";

  const params = await searchParams ?? {};

  const [carsList, bookingsList] = await Promise.all([
    isOwner ? getCarsByCompany(ctx.companyId) : getCarsByBranch(ctx.branchId!),
    isOwner ? getBookingsByCompany(ctx.companyId) : getBookingsByBranch(ctx.branchId!),
  ]);

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <PartnerNav />

       

{params.welcome && ctx.companyStatus === "pending" && (
  <div className="bg-amber-50 border border-amber-100 rounded-[20px] p-5 mb-6">
    <p className="font-semibold text-amber-800">Company submitted for review</p>
    <p className="text-sm text-amber-700 mt-1">
      Your company is pending admin approval. You can already add branches and cars while you wait —
      they'll go live automatically the moment your company is approved.
    </p>
  </div>
)}

      <h1 className="text-2xl font-bold text-slate-800 mb-1">{ctx.companyName}</h1>
      <div className="flex items-center gap-2 mb-8">
        <span className={`text-xs uppercase font-semibold px-2.5 py-1 rounded-full ${statusStyles[ctx.companyStatus] ?? "text-slate-600 bg-slate-100"}`}>
          {ctx.companyStatus}
        </span>
        <span className="text-xs uppercase font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">
          {ctx.role.replace("_", " ")}
        </span>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-slate-800">
          {isOwner ? "All cars" : "Your branch's cars"} ({carsList.length})
        </h2>
        <Link href="/partner/cars/new" className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
          + Add a car
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {carsList.map((car) => (
          <div key={car.id} className="bg-white border border-gray-200 rounded-[20px] p-5">
            <div className="font-semibold text-slate-800">{car.brand} {car.model}</div>
            <div className="text-slate-500 text-sm capitalize mb-3">
              {car.category} · Rs {Number(car.pricePerDay).toLocaleString()}/day
            </div>
            <Link href={`/partner/cars/${car.id}/availability`} className="text-brand text-sm font-medium hover:underline">
              Manage availability
            </Link>
          </div>
        ))}
        {carsList.length === 0 && <p className="text-slate-400 text-sm">No cars listed yet.</p>}
      </div>

      <h2 className="font-semibold text-slate-800 mb-4">
        {isOwner ? "All bookings" : "Your branch's bookings"} ({bookingsList.length})
      </h2>
      <div className="space-y-3">
        {bookingsList.map((b) => (
          <Link
            key={b.id}
            href={`/partner/bookings/${b.id}`}
            className="block bg-white border border-gray-200 rounded-[20px] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-slate-800">{b.carBrand} {b.carModel}</div>
                <div className="text-slate-500 text-sm">
                  {formatDate(b.pickupAt, b.timezone)} → {formatDate(b.dropoffAt, b.timezone)}
                </div>
              </div>
              <span className={`text-xs uppercase font-semibold px-2.5 py-1 rounded-full ${statusStyles[b.status] ?? "text-slate-600 bg-slate-100"}`}>
                {b.status}
              </span>
            </div>
          </Link>
        ))}
        {bookingsList.length === 0 && <p className="text-slate-400 text-sm">No bookings yet.</p>}
      </div>
    </main>
  );
}