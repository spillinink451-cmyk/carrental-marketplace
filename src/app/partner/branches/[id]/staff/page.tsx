import { requireBranchAdminAccess } from "@/lib/partner-auth";
import { getStaffForBranch } from "@/db/queries";
import AddStaffForm from "@/components/AddStaffForm";
import { removeStaffMember } from "@/app/actions/staff";
import PartnerNav from "@/components/PartnerNav";

export default async function BranchStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireBranchAdminAccess(id);
  const staff = await getStaffForBranch(id);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <PartnerNav />
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Branch staff</h1>
      <p className="text-slate-500 text-sm mb-8">{staff.length} staff member{staff.length === 1 ? "" : "s"}</p>

      <div className="bg-white border border-gray-200 rounded-[20px] p-6 mb-8">
        <h2 className="font-semibold text-slate-800 mb-4">Add staff</h2>
        <AddStaffForm branchId={id} />
      </div>

      <div className="space-y-2">
        {staff.map((s) => (
          <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center text-sm">
            <div>
              <p className="font-medium text-slate-800">{s.userName ?? "—"}</p>
              <p className="text-slate-500">{s.userEmail}</p>
            </div>
            <form action={removeStaffMember.bind(null, s.id, id)}>
              <button className="text-red-600 text-xs font-semibold hover:underline">Remove</button>
            </form>
          </div>
        ))}
        {staff.length === 0 && <p className="text-slate-400 text-sm">No staff added yet.</p>}
      </div>
    </main>
  );
}