import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Scissors, ShoppingBag, SendHorizontal, MessageSquare, ClipboardCheck, DollarSign, Bell } from "lucide-react";

export default async function SupplierDashboard() {
  const user = await getCurrentUser();
  const profile = user!.supplierProfile!;

  // Aggregates
  const activeFabricsCount = await db.fabric.count({
    where: { supplierId: profile.id, status: "PUBLISHED" },
  });

  const sampleRequestsCount = await db.sampleOrder.count({
    where: { supplierId: profile.id },
  });

  const newRfqsCount = await db.rFQ.count({
    where: { supplierId: profile.id, status: "REQUESTED" },
  });

  const activeNegotiationsCount = await db.negotiation.count({
    where: { supplierId: profile.id },
  });

  const activeOrdersCount = await db.bulkOrder.count({
    where: {
      supplierId: profile.id,
      status: { in: ["PAID", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED", "INSPECTION_PERIOD"] },
    },
  });

  // Calculate Bulk Sales GMV
  const salesOrders = await db.bulkOrder.findMany({
    where: {
      supplierId: profile.id,
      status: {
        in: [
          "PAID",
          "PROCESSING",
          "READY_TO_SHIP",
          "SHIPPED",
          "DELIVERED",
          "INSPECTION_PERIOD",
          "COMPLETED",
        ],
      },
    },
  });
  const totalSalesGmv = salesOrders.reduce((sum, order) => sum + order.subtotal.toNumber(), 0);

  // Fetch action items: Sample orders that are verified (CONFIRMED) but not shipped yet
  const actionSampleOrders = await db.sampleOrder.findMany({
    where: {
      supplierId: profile.id,
      status: "CONFIRMED",
    },
    include: {
      fabric: true,
    },
    take: 5,
  });

  // Fetch recent notifications
  const notifications = await db.notification.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Supplier Dashboard</h1>
        <p className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">Manage your loom inventory and B2B client contracts.</p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[
          { label: "Active Fabrics", value: activeFabricsCount, href: "/supplier/fabrics", icon: Scissors, bg: "bg-blue-50 text-blue-600" },
          { label: "Sample Requests", value: sampleRequestsCount, href: "/supplier/samples", icon: ShoppingBag, bg: "bg-indigo-50 text-indigo-600" },
          { label: "New RFQs", value: newRfqsCount, href: "/supplier/quotes", icon: SendHorizontal, bg: "bg-amber-50 text-amber-600" },
          { label: "Active Negotiations", value: activeNegotiationsCount, href: "/supplier/negotiations", icon: MessageSquare, bg: "bg-teal-50 text-teal-600" },
          { label: "Active Bulk Orders", value: activeOrdersCount, href: "/supplier/orders", icon: ClipboardCheck, bg: "bg-violet-50 text-violet-600" },
          { label: "Total Sales (GMV)", value: `₹${totalSalesGmv.toLocaleString()}`, href: "/supplier/orders", icon: DollarSign, bg: "bg-emerald-50 text-emerald-600" },
        ].map((card, idx) => (
          <Link
            key={idx}
            href={card.href}
            className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow transition-shadow flex justify-between items-start"
          >
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {card.label}
              </span>
              <span className="text-lg sm:text-2xl font-black text-slate-900 mt-2 block">{card.value}</span>
            </div>
            <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center ${card.bg}`}>
              <card.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Action Required: Sample Orders Pending Dispatch */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-slate-500" /> Action Required: Samples to Dispatch
            </h3>
            <Link href="/supplier/samples" className="text-xs font-semibold text-blue-600 hover:text-blue-500">
              View All
            </Link>
          </div>

          {actionSampleOrders.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              No pending confirmed samples to dispatch. All set!
            </div>
          ) : (
            <div className="space-y-3">
              {actionSampleOrders.map((ord) => (
                <div key={ord.id} className="flex justify-between items-center text-xs p-3 bg-yellow-50/30 border border-yellow-100 rounded">
                  <div>
                    <span className="font-bold text-slate-950 block">{ord.id}</span>
                    <span className="text-slate-500 font-semibold block mt-0.5">
                      Fabric: {ord.fabric.name} | Qty: {ord.quantity} unit(s)
                    </span>
                  </div>
                  <Link
                    href="/supplier/samples"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider"
                  >
                    Pack & Ship
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications list */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-slate-500" /> Recent Notifications
            </h3>
          </div>

          {notifications.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              No new alerts.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-3 bg-slate-50 border border-slate-100 rounded text-xs leading-relaxed">
                  <p className="font-medium text-slate-700">{notif.text}</p>
                  <span className="block text-[9px] text-slate-400 mt-1 font-semibold">
                    {new Date(notif.createdAt).toLocaleDateString()}
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
