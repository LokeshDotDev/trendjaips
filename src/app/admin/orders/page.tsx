import React from "react";
import { db } from "@/lib/db";
import { CheckSquare } from "lucide-react";

export default async function AdminOrdersPage() {
  const orders = await db.bulkOrder.findMany({
    include: {
      buyer: true,
      supplier: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-blue-600" /> Platform Bulk Orders
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5 font-medium">
          Comprehensive ledger of B2B commercial textile contracts placed on the platform.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
            <tr>
              <th className="px-6 py-4">Contract ID</th>
              <th className="px-6 py-4">Buyer Business</th>
              <th className="px-6 py-4">Supplier Mill</th>
              <th className="px-6 py-4">Fabric Product</th>
              <th className="px-6 py-4 text-right">Quantity</th>
              <th className="px-6 py-4 text-right">Contract Total</th>
              <th className="px-6 py-4 text-right">Platform Commission</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-900 block">{ord.id}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span>{ord.buyer.businessName}</span>
                </td>
                <td className="px-6 py-4">
                  <span>{ord.supplier.businessName}</span>
                </td>
                <td className="px-6 py-4">
                  <span>{ord.fabricNameSnapshot}</span>
                </td>
                <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                  <span>{ord.quantity.toLocaleString()} {ord.unit}s</span>
                </td>
                <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                  <span>₹{parseFloat(ord.total.toString()).toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-right text-emerald-600 font-extrabold">
                  <span>₹{parseFloat(ord.commissionAmount.toString()).toLocaleString()} (2%)</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                    ord.status === "COMPLETED"
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                      : ord.status === "DISPUTED"
                      ? "bg-red-50 border-red-100 text-red-700"
                      : "bg-yellow-50 border-yellow-100 text-yellow-700"
                  }`}>
                    {ord.status.replace(/_/g, " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
