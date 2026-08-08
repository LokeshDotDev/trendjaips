import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function SupplierNegotiationsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPPLIER" || !user.supplierProfile) {
    redirect("/auth/login");
  }

  const profile = user.supplierProfile;

  // Fetch negotiations
  const negotiations = await db.negotiation.findMany({
    where: { supplierId: profile.id },
    include: {
      rfq: {
        include: { fabric: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-blue-600" /> Active Negotiations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Communicate with buyers, review specifications, and submit structured counteroffers.
        </p>
      </div>

      {negotiations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center text-slate-500 space-y-2 max-w-xl mx-auto">
          <MessageSquare className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No negotiations</h3>
          <p className="text-xs">Your threads will appear here once buyers request quotes for your listings.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Negotiation Room</th>
                <th className="px-6 py-4">Fabric</th>
                <th className="px-6 py-4 text-right">Negotiated Qty</th>
                <th className="px-6 py-4 text-right">Target Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {negotiations.map((neg) => (
                <tr key={neg.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 block">Room: {neg.id.slice(0,8)}...</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest">
                      RFQ Ref: {neg.rfqId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span>{neg.rfq.fabric.name}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                    <span>{neg.rfq.quantity.toLocaleString()} m</span>
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                    <span>₹{parseFloat(neg.rfq.targetPrice.toString()).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                      neg.rfq.status === "ACCEPTED" || neg.rfq.status === "ORDER_CREATED"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-blue-50 border-blue-100 text-blue-700"
                    }`}>
                      {neg.rfq.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/negotiations/${neg.id}`}
                      className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider shadow-sm"
                    >
                      Open Chat <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
