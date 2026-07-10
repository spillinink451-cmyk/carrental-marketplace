"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = ["economy", "compact", "suv", "luxury", "van"];
const TRANSMISSIONS = ["automatic", "manual"];

export default function SearchBar({ cities }: { cities: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/?${params.toString()}`);
  }

  const hasFilters = searchParams.get("category") || searchParams.get("transmission");

  return (
    <div className="flex items-center gap-2">
      <select
        className="border border-line rounded-lg px-3 py-1.5 text-xs font-data bg-white"
        defaultValue={searchParams.get("category") ?? ""}
        onChange={(e) => updateParam("category", e.target.value)}
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select
        className="border border-line rounded-lg px-3 py-1.5 text-xs font-data bg-white"
        defaultValue={searchParams.get("transmission") ?? ""}
        onChange={(e) => updateParam("transmission", e.target.value)}
      >
        <option value="">Any transmission</option>
        {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      {hasFilters && (
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("category");
            params.delete("transmission");
            router.push(`/?${params.toString()}`);
          }}
          className="text-xs text-asphalt underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}