import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FolderTree, Plus, Check, EyeOff, Eye, Trash2 } from "lucide-react";
import CategoryFormClient from "./CategoryFormClient";
import CategoryItemClient from "./CategoryItemClient";

export default async function AdminCategoriesPage() {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // Fetch flat categories list to populate dropdown
  const allCategories = await db.category.findMany({
    orderBy: { name: "asc" }
  });

  // Fetch root categories containing nested subcategories
  const rootCategories = await db.category.findMany({
    where: { parentId: null },
    include: {
      subcategories: {
        orderBy: { displayOrder: "asc" }
      }
    },
    orderBy: { displayOrder: "asc" }
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FolderTree className="h-6 w-6 text-blue-600" /> Platform Category Management
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5 font-medium">
          Create, nest, and structure the product catalog hierarchy to enable B2B fabric discovery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Category Tree List */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Catalog Category Hierarchy
          </h3>

          {rootCategories.length === 0 ? (
            <p className="text-slate-400 text-xs py-4">No categories configured yet.</p>
          ) : (
            <div className="space-y-4">
              {rootCategories.map((parent) => (
                <div key={parent.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 space-y-3">
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{parent.name}</span>
                      <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">SLUG: {parent.slug}</span>
                    </div>
                    <CategoryItemClient categoryId={parent.id} isActive={parent.isActive} />
                  </div>

                  {/* Subcategories (Second level) */}
                  {parent.subcategories.length > 0 && (
                    <div className="pl-6 border-l border-dashed border-slate-200 space-y-2">
                      {parent.subcategories.map((sub) => (
                        <div key={sub.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200/50 shadow-sm text-xs">
                          <div>
                            <span className="font-bold text-slate-800">— {sub.name}</span>
                            <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">SLUG: {sub.slug}</span>
                          </div>
                          <CategoryItemClient categoryId={sub.id} isActive={sub.isActive} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Form to add new Category */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
            Create New Category
          </h3>
          <CategoryFormClient allCategories={allCategories} />
        </div>
      </div>
    </div>
  );
}
