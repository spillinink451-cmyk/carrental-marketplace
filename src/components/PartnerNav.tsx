import Link from "next/link";

export default function PartnerNav() {
  return (
    <div className="flex gap-1 mb-8 bg-white border border-gray-200 rounded-full p-1 w-fit flex-wrap">
      <Link href="/partner" className="text-sm font-medium text-slate-600 hover:text-brand hover:bg-brand/5 px-4 py-2 rounded-full transition-colors">
        Dashboard
      </Link>
      <Link href="/partner/branches" className="text-sm font-medium text-slate-600 hover:text-brand hover:bg-brand/5 px-4 py-2 rounded-full transition-colors">
        Branches
      </Link>
      <Link href="/partner/disputes" className="text-sm font-medium text-slate-600 hover:text-brand hover:bg-brand/5 px-4 py-2 rounded-full transition-colors">
        Disputes
      </Link>
      <Link href="/partner/cars/new" className="text-sm font-medium text-slate-600 hover:text-brand hover:bg-brand/5 px-4 py-2 rounded-full transition-colors">
        + Add a car
      </Link>
      <Link href="/partner/leases/new" className="text-sm font-medium text-slate-600 hover:text-brand hover:bg-brand/5 px-4 py-2 rounded-full transition-colors">
         + New lease
      </Link>
    </div>
  );
}