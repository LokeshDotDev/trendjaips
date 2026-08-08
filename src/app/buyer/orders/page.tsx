import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import BuyerOrdersClient from "./BuyerOrdersClient";

export default async function BuyerOrdersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "BUYER" || !user.buyerProfile) {
    redirect("/auth/login");
  }

  const profile = user.buyerProfile;

  // Fetch bulk orders placed by the buyer
  const bulkOrders = await db.bulkOrder.findMany({
    where: { buyerId: profile.id },
    include: {
      fabric: {
        include: { supplier: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-blue-600" /> My Bulk Orders
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Procure bulk quantities, manage payments, track processing progress, and raise quality disputes.
        </p>
      </div>

      {bulkOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center text-slate-500 space-y-4 max-w-xl mx-auto">
          <ClipboardList className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Bulk Orders Logged</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you accept a supplier's negotiated structured offer in the Negotiation Room, you can place a bulk contract order.
          </p>
          <Link
            href="/buyer/negotiations"
            className="inline-flex bg-slate-900 text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded hover:bg-slate-800"
          >
            Go to Negotiations
          </Link>
        </div>
      ) : (
        <BuyerOrdersClient initialOrders={bulkOrders} />
      )}
    </div>
  );
}
