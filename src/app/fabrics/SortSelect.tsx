"use client";

import React, { startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

export default function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "recommended";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextValue = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", nextValue);
    
    // Wrap state navigation in transition for smooth UI transition
    startTransition(() => {
      router.push(`/fabrics?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" /> Sort By
      </span>
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="text-xs border border-slate-200 rounded px-3 py-1.5 text-slate-800 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 transition-shadow shadow-sm cursor-pointer"
      >
        <option value="recommended">Newest Listings</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="moq-asc">MOQ: Low to High</option>
        <option value="gsm-desc">GSM: High to Low</option>
      </select>
    </div>
  );
}
