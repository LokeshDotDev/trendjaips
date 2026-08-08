import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessageSquare, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function SupplierQuotesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPPLIER" || !user.supplierProfile) {
    redirect("/auth/login");
  }

  const profile = user.supplierProfile;

  // Fetch RFQs received by supplier
  const rfqs = await db.rFQ.findMany({
    where: { supplierId: profile.id },
    include: {
      buyer: true,
      fabric: true,
      negotiation: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-blue-600" /> Bulk Quote Requests (RFQs)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          View bulk inquiries submitted by fashion brands, designers, and boutiques. Open the room to negotiate structured offers.
        </p>
      </div>

      {rfqs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center text-slate-500 space-y-2 max-w-xl mx-auto">
          <MessageSquare className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Bulk Requests Yet</h3>
          <p className="text-xs">Buyers will appear here when they request pricing for your loom listings.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">RFQ Reference</th>
                <th className="px-6 py-4">Buyer Company</th>
                <th className="px-6 py-4">Fabric</th>
                <th className="px-6 py-4 text-right">Target Quantity</th>
                <th className="px-6 py-4 text-right">Target Price</th>
                <th className="px-6 py-4">Delivery Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Negotiation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {rfqs.map((rfq) => (
                <tr key={rfq.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 block">{rfq.id}</span>
                    <span className="block text-[9px] text-slate-400 mt-0.5">
                      Submitted: {new Date(rfq.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span>{rfq.buyer.businessName}</span>
                    <span className="block text-[9px] text-slate-400 mt-0.5">Person: {rfq.buyer.contactName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span>{rfq.fabric.name}</span>
                    <span className="block text-[9px] text-slate-400 mt-0.5">Colors: {rfq.color}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                    <span>{rfq.quantity.toLocaleString()} {rfq.unit}s</span>
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                    <span>₹{parseFloat(rfq.targetPrice.toString()).toFixed(2)}/m</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <span>{new Date(rfq.requiredDeliveryDate).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                      rfq.status === "ACCEPTED" || rfq.status === "ORDER_CREATED"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : rfq.status === "REQUESTED"
                        ? "bg-blue-50 border-blue-100 text-blue-700"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}>
                      {rfq.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {rfq.negotiation ? (
                      <Link
                        href={`/negotiations/${rfq.negotiation.id}`}
                        className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider"
                      >
                        Enter Room <ArrowRight className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="text-slate-400">Locked</span>
                    )}
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
