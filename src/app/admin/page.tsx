import React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { DollarSign, Percent, ShoppingBag, Layers, Users, Sparkles, AlertTriangle, FileText, CheckSquare, Clock } from "lucide-react";

export default async function AdminDashboard() {
  // Aggregate stats
  const completedBulkOrders = await db.bulkOrder.findMany({
    where: {
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

  const totalGmv = completedBulkOrders.reduce((sum, order) => sum + order.total.toNumber(), 0);
  const totalCommission = completedBulkOrders.reduce(
    (sum, order) => sum + order.commissionAmount.toNumber(),
    0
  );

  const sampleOrdersCount = await db.sampleOrder.count();
  const bulkOrdersCount = await db.bulkOrder.count();
  
  const activeSuppliersCount = await db.supplierProfile.count({
    where: { status: "VERIFIED" },
  });

  const publishedFabricsCount = await db.fabric.count({
    where: { status: "PUBLISHED" },
  });

  // Pending queues
  const pendingPaymentsCount =
    (await db.sampleOrder.count({
      where: { status: "PAYMENT_VERIFICATION" },
    })) +
    (await db.bulkOrder.count({
      where: { status: "PAYMENT_VERIFICATION" },
    }));

  const pendingSuppliersCount = await db.supplierProfile.count({
    where: { status: "PENDING" },
  });

  const pendingFabricsCount = await db.fabric.count({
    where: { status: "PENDING_APPROVAL" },
  });

  const openDisputesCount = await db.dispute.count({
    where: { status: "OPEN" },
  });

  // Recent transactions list
  const recentSampleOrders = await db.sampleOrder.findMany({
    include: {
      buyer: true,
      fabric: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentBulkOrders = await db.bulkOrder.findMany({
    include: {
      buyer: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Control Room</h1>
        <p className="text-slate-500 font-medium text-sm mt-0.5">Platform overview and operational queues.</p>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total GMV", value: `₹${totalGmv.toLocaleString()}`, sub: "Settled & In-transit", icon: DollarSign, color: "text-blue-600 bg-blue-50" },
          { label: "Platform Commission (2%)", value: `₹${totalCommission.toLocaleString()}`, sub: "Cumulative Revenue", icon: Percent, color: "text-emerald-600 bg-emerald-50" },
          { label: "Sample Orders", value: sampleOrdersCount, sub: "Doorstep test dispatches", icon: ShoppingBag, color: "text-indigo-600 bg-indigo-50" },
          { label: "Bulk Orders", value: bulkOrdersCount, sub: "Commercial contracts", icon: Layers, color: "text-violet-600 bg-violet-50" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{card.label}</span>
              <span className="text-2xl font-black text-slate-900 mt-2 block">{card.value}</span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-1">{card.sub}</span>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Action Queues */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action Required Queues</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Pending Payments", value: pendingPaymentsCount, href: "/admin/payments", icon: DollarSign, activeColor: "border-yellow-200 bg-yellow-50 text-yellow-800" },
            { label: "Pending Suppliers", value: pendingSuppliersCount, href: "/admin/suppliers", icon: Users, activeColor: "border-blue-200 bg-blue-50 text-blue-800" },
            { label: "Pending Fabrics", value: pendingFabricsCount, href: "/admin/fabrics", icon: FileText, activeColor: "border-indigo-200 bg-indigo-50 text-indigo-800" },
            { label: "Open Disputes", value: openDisputesCount, href: "/admin/disputes", icon: AlertTriangle, activeColor: "border-red-200 bg-red-50 text-red-800" },
          ].map((queue, idx) => (
            <Link
              key={idx}
              href={queue.href}
              className={`border rounded-lg p-5 flex flex-col justify-between hover:shadow transition-shadow ${
                queue.value > 0
                  ? queue.activeColor
                  : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider">{queue.label}</span>
                <queue.icon className="h-4 w-4" />
              </div>
              <span className="text-3xl font-black">{queue.value}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Recent Sample Orders */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-slate-500" /> Recent Sample Orders
            </h3>
            <Link href="/admin/payments" className="text-xs font-semibold text-blue-600 hover:text-blue-500">
              View All
            </Link>
          </div>

          {recentSampleOrders.length === 0 ? (
            <p className="text-slate-500 text-sm">No sample orders logged.</p>
          ) : (
            <div className="space-y-3">
              {recentSampleOrders.map((ord) => (
                <div key={ord.id} className="flex justify-between items-center text-xs p-3 hover:bg-slate-50 rounded border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-900 block">{ord.id}</span>
                    <span className="text-slate-400 font-semibold block mt-0.5">
                      Buyer: {ord.buyer.businessName} | Fabric: {ord.fabric.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 block">₹{ord.totalPrice.toString()}</span>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${
                      ord.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-600"
                        : ord.status === "PAYMENT_VERIFICATION"
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bulk Orders */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-slate-500" /> Recent Bulk Orders
            </h3>
            <Link href="/admin/orders" className="text-xs font-semibold text-blue-600 hover:text-blue-500">
              View All
            </Link>
          </div>

          {recentBulkOrders.length === 0 ? (
            <p className="text-slate-500 text-sm">No bulk orders logged.</p>
          ) : (
            <div className="space-y-3">
              {recentBulkOrders.map((ord) => (
                <div key={ord.id} className="flex justify-between items-center text-xs p-3 hover:bg-slate-50 rounded border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-900 block">{ord.id}</span>
                    <span className="text-slate-400 font-semibold block mt-0.5">
                      Buyer: {ord.buyer.businessName} | Qty: {ord.quantity} {ord.unit}s
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 block">₹{ord.total.toString()}</span>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${
                      ord.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-600"
                        : ord.status === "PAYMENT_VERIFICATION"
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
