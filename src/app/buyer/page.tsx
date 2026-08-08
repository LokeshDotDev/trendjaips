import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, MessageSquare, ClipboardList, CheckCircle2, Sliders } from "lucide-react";

export default async function BuyerDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "BUYER" || !user.buyerProfile) {
    redirect("/auth/login");
  }

  const profile = user.buyerProfile;

  // Compute metrics
  const samplesOrderedCount = await db.sampleOrder.count({
    where: { buyerId: profile.id },
  });

  const activeQuotesCount = await db.rFQ.count({
    where: { buyerId: profile.id, status: { in: ["REQUESTED", "SUPPLIER_REVIEWING", "NEGOTIATING"] } },
  });

  const activeNegotiationsCount = await db.negotiation.count({
    where: { buyerId: profile.id },
  });

  const bulkOrdersCount = await db.bulkOrder.count({
    where: { buyerId: profile.id },
  });

  const completedOrdersCount = await db.bulkOrder.count({
    where: { buyerId: profile.id, status: "COMPLETED" },
  });

  // Recent sample orders
  const recentSamples = await db.sampleOrder.findMany({
    where: { buyerId: profile.id },
    include: { fabric: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // Recent bulk orders
  const recentBulk = await db.bulkOrder.findMany({
    where: { buyerId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Buyer Dashboard</h1>
        <p className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">Procurement overview and active negotiations.</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Samples Ordered", value: samplesOrderedCount, href: "/buyer/samples", icon: ShoppingBag, bg: "bg-blue-50 text-blue-600" },
          { label: "Active Quotes", value: activeQuotesCount, href: "/buyer/quotes", icon: MessageSquare, bg: "bg-amber-50 text-amber-600" },
          { label: "Negotiations", value: activeNegotiationsCount, href: "/buyer/negotiations", icon: Sliders, bg: "bg-teal-50 text-teal-600" },
          { label: "Bulk Orders", value: bulkOrdersCount, href: "/buyer/orders", icon: ClipboardList, bg: "bg-violet-50 text-violet-600" },
          { label: "Completed", value: completedOrdersCount, href: "/buyer/orders", icon: CheckCircle2, bg: "bg-emerald-50 text-emerald-600" },
        ].map((card, idx) => (
          <Link
            key={idx}
            href={card.href}
            className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow transition-shadow flex justify-between items-start"
          >
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{card.label}</span>
              <span className="text-xl font-black text-slate-900 mt-1.5 block">{card.value}</span>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${card.bg}`}>
              <card.icon className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Recent Samples */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-slate-500" /> Recent Sample Orders
            </h3>
            <Link href="/buyer/samples" className="text-xs font-semibold text-blue-600 hover:text-blue-500">
              View All
            </Link>
          </div>

          {recentSamples.length === 0 ? (
            <p className="text-slate-400 text-xs py-4">No physical samples ordered yet.</p>
          ) : (
            <div className="space-y-3">
              {recentSamples.map((ord) => (
                <div key={ord.id} className="flex justify-between items-center text-xs p-3 hover:bg-slate-50 rounded border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-900 block">{ord.id}</span>
                    <span className="text-slate-400 font-semibold block mt-0.5">Fabric: {ord.fabric.name}</span>
                  </div>
                  <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    ord.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                  }`}>
                    {ord.status.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bulk Contracts */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-slate-500" /> Recent Bulk Contracts
            </h3>
            <Link href="/buyer/orders" className="text-xs font-semibold text-blue-600 hover:text-blue-500">
              View All
            </Link>
          </div>

          {recentBulk.length === 0 ? (
            <p className="text-slate-400 text-xs py-4">No bulk orders placed yet.</p>
          ) : (
            <div className="space-y-3">
              {recentBulk.map((ord) => (
                <div key={ord.id} className="flex justify-between items-center text-xs p-3 hover:bg-slate-50 rounded border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-900 block">{ord.id}</span>
                    <span className="text-slate-400 font-semibold block mt-0.5">
                      Price: ₹{parseFloat(ord.pricePerUnit.toString()).toFixed(2)}/m | Qty: {ord.quantity.toLocaleString()}
                    </span>
                  </div>
                  <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    ord.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                  }`}>
                    {ord.status.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
