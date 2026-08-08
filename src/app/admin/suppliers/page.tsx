import React from "react";
import { db } from "@/lib/db";
import { Users, ShieldAlert, Award } from "lucide-react";
import SupplierQueueClient from "./SupplierQueueClient";

export default async function AdminSuppliersPage() {
  const pendingSuppliers = await db.supplierProfile.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" /> Supplier Approvals
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Moderate new registration applications from Surat manufacturers, traders, and wholesalers.
        </p>
      </div>

      {pendingSuppliers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 space-y-2">
          <Award className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">All caught up!</h3>
          <p className="text-xs">No pending supplier onboarding profiles waiting verification.</p>
        </div>
      ) : (
        <SupplierQueueClient initialSuppliers={pendingSuppliers} />
      )}
    </div>
  );
}
