import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PlusCircle } from "lucide-react";
import AddFabricFormClient from "./AddFabricFormClient";

export default async function AddFabricPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPPLIER" || !user.supplierProfile) {
    redirect("/auth/login");
  }

  const profile = user.supplierProfile;
  if (profile.status !== "VERIFIED") {
    redirect("/supplier");
  }

  const categories = await db.category.findMany();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans">
      <div className="border-b border-slate-200 pb-5 mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <PlusCircle className="h-6 w-6 text-blue-600" /> Add New Fabric Listing
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Submit detailed loom specifications. Listing requires admin moderation review before going live.
        </p>
      </div>

      <AddFabricFormClient categories={categories} />
    </div>
  );
}
