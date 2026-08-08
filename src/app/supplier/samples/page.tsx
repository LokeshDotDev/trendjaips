import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import SampleRequestsClient from "./SampleRequestsClient";

export default async function SupplierSamplesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPPLIER" || !user.supplierProfile) {
    redirect("/auth/login");
  }

  const profile = user.supplierProfile;

  // Fetch sample orders received by the supplier
  const sampleOrders = await db.sampleOrder.findMany({
    where: { supplierId: profile.id },
    include: {
      buyer: true,
      fabric: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-blue-600" /> Sample Requests
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Fulfill physical fabric samples ordered by buyers. Fulfilling samples drives bulk contract RFQs.
        </p>
      </div>

      {sampleOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center text-slate-500 space-y-2 max-w-xl mx-auto">
          <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Sample Requests</h3>
          <p className="text-xs">Buyers will appear here once they request swatches or fabric cuts from your page.</p>
        </div>
      ) : (
        <SampleRequestsClient initialOrders={sampleOrders} />
      )}
    </div>
  );
}
