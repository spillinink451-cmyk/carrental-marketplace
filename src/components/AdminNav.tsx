import Link from "next/link";

export default function AdminNav() {
  return (
    <div className="flex gap-1 mb-8 bg-white border border-gray-200 rounded-full p-1 w-fit">
      <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-brand hover:bg-brand/5 px-4 py-2 rounded-full transition-colors">
        Dashboard
      </Link>
      <Link href="/admin/companies" className="text-sm font-medium text-slate-600 hover:text-brand hover:bg-brand/5 px-4 py-2 rounded-full transition-colors">
        Companies
      </Link>
      <Link href="/admin/disputes" className="text-sm font-medium text-slate-600 hover:text-brand hover:bg-brand/5 px-4 py-2 rounded-full transition-colors">
        Disputes
      </Link>
    </div>
  );
}