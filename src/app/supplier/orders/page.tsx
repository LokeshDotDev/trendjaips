import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import SupplierOrdersClient from "./SupplierOrdersClient";

export default async function SupplierOrdersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPPLIER" || !user.supplierProfile) {
    redirect("/auth/login");
  }

  const profile = user.supplierProfile;

  // Fetch bulk orders received by supplier
  const bulkOrders = await db.bulkOrder.findMany({
    where: { supplierId: profile.id },
    include: {
      buyer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-blue-600" /> Bulk Client Orders
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Track production batches, manage shipping manifests, and coordinate quality settlements.
        </p>
      </div>

      {bulkOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center text-slate-500 space-y-2 max-w-xl mx-auto">
          <ClipboardList className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Bulk Orders Logged</h3>
          <p className="text-xs">Incoming bulk orders will appear here once buyers accept your negotiated structured offers.</p>
        </div>
      ) : (
        <SupplierOrdersClient initialOrders={bulkOrders} />
      )}
    </div>
  );
}
