import { requireCarForCompany } from "@/lib/partner-auth";
import { getBlockedDates } from "@/db/queries";
import AvailabilityForm from "@/components/AvailabilityForm";
import { removeBlockedDate } from "@/app/actions/availability";
import PartnerNav from "@/components/PartnerNav";

export default async function CarAvailabilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await requireCarForCompany(id);
  const blocked = await getBlockedDates(id);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <PartnerNav />
      <h1 className="text-2xl font-bold text-slate-800 mb-1">
        {car.brand} {car.model} — Availability
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        Block dates this car isn&apos;t available (maintenance, already rented elsewhere, etc.)
      </p>

      <div className="bg-white border border-gray-200 rounded-[20px] p-6 mb-8">
        <AvailabilityForm carId={id} />
      </div>

      <h2 className="font-semibold text-slate-800 mb-3">Blocked periods</h2>
      <div className="space-y-2">
        {blocked.map((b) => (
          <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-4 text-sm flex justify-between items-center">
            <div>
              <span className="text-slate-700 font-medium">
                {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
              </span>
              {b.reason && <span className="text-slate-400 ml-2">({b.reason})</span>}
            </div>
            <form action={removeBlockedDate.bind(null, b.id, id)}>
              <button className="text-red-600 text-xs font-semibold hover:underline">Remove</button>
            </form>
          </div>
        ))}
        {blocked.length === 0 && <p className="text-slate-400 text-sm">No blocked dates.</p>}
      </div>
    </main>
  );
}