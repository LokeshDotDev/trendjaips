"use client";

import React, { useTransition } from "react";
import { toggleCategoryActiveAction } from "../actions";
import { Eye, EyeOff } from "lucide-react";

interface CategoryItemClientProps {
  categoryId: string;
  isActive: boolean;
}

export default function CategoryItemClient({ categoryId, isActive }: CategoryItemClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleCategoryActiveAction(categoryId, !isActive);
      if (res.error) {
        alert(res.error);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
        isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
      } disabled:opacity-50`}
      title={isActive ? "Deactivate Category" : "Activate Category"}
    >
      {isActive ? (
        <>
          <Eye className="h-3 w-3" /> Active
        </>
      ) : (
        <>
          <EyeOff className="h-3 w-3" /> Inactive
        </>
      )}
    </button>
  );
}
