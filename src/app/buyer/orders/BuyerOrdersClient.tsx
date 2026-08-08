"use client";

import React, { useState, useTransition, useEffect } from "react";
import { buyerAcceptBulkOrderAction, raiseDisputeAction } from "../../checkout/bulk-actions";
import { useRouter } from "next/navigation";
import { ClipboardList, CreditCard, ShieldCheck, AlertTriangle, RefreshCw, Eye, ArrowRight, Truck, Check } from "lucide-react";
import Link from "next/link";

interface BulkOrder {
  id: string;
  fabricId: string;
  fabricNameSnapshot: string;
  fabricIdSnapshot: string;
  fabricDescSnapshot: string | null;
  quantity: number;
  unit: string;
  pricePerUnit: any;
  subtotal: any;
  shipping: any;
  total: any;
  productionTime: number;
  status: string;
  courierName: string | null;
  trackingId: string | null;
  trackingUrl: string | null;
  deliveredAt: Date | null;
  inspectionEndsAt: Date | null;
  utr: string | null;
  createdAt: Date;
  fabric: {
    id: string;
    slug: string;
    supplier: {
      businessName: string;
    };
  };
}

export default function BuyerOrdersClient({ initialOrders }: { initialOrders: BulkOrder[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [isPending, startTransition] = useTransition();

  // Dispute toggles
  const [activeDisputeOrderId, setActiveDisputeOrderId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("Wrong fabric");
  const [disputeDesc, setDisputeDesc] = useState("");

  const handleAccept = (orderId: string) => {
    if (!confirm("Are you sure you want to accept this order? The inspection period will end, and funds will be released for settlement.")) {
      return;
    }

    startTransition(async () => {
      const res = await buyerAcceptBulkOrderAction(orderId);
      if (res.error) {
        alert(res.error);
      } else {
        alert("Bulk order successfully accepted!");
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "COMPLETED" } : o)));
      }
    });
  };

  const handleDispute = (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    if (!disputeDesc.trim()) {
      alert("Please provide details explaining the defect/shortage.");
      return;
    }

    startTransition(async () => {
      const res = await raiseDisputeAction(orderId, disputeReason, disputeDesc);
      if (res.error) {
        alert(res.error);
      } else {
        alert("Dispute raised successfully. Admins have been notified.");
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "DISPUTED" } : o)));
        setActiveDisputeOrderId(null);
        setDisputeDesc("");
      }
    });
  };

  // Helper to compute countdown
  const getCountdownText = (endsAt: Date | null) => {
    if (!endsAt) return "";
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return "Expired (Auto-completing)";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m left`;
  };

  return (
    <div className="space-y-6">
      {orders.map((ord) => {
        const isInspection = ord.status === "DELIVERED";
        
        return (
          <div key={ord.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="font-black text-slate-900 text-sm">Contract ID: {ord.id}</span>
                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                  Ordered: {new Date(ord.createdAt).toLocaleDateString()} | Supplier: {ord.fabric.supplier.businessName}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="font-black text-slate-950 text-sm block">Total Amount: ₹{parseFloat(ord.total.toString()).toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                  Price: ₹{parseFloat(ord.pricePerUnit.toString()).toFixed(2)}/m | Qty: {ord.quantity.toLocaleString()} {ord.unit}s
                </span>
              </div>
            </div>

            {/* Content info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Fabric Snapshop</span>
                <span className="font-bold text-slate-900 block">{ord.fabricNameSnapshot}</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Loom ID: {ord.fabricIdSnapshot}</span>
                <span className="text-[10px] text-slate-500 block leading-relaxed mt-1 line-clamp-2">{ord.fabricDescSnapshot}</span>
              </div>

              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Fulfillment Status</span>
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  ord.status === "COMPLETED"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : ord.status === "DISPUTED"
                    ? "bg-red-50 border-red-100 text-red-700"
                    : ord.status === "SHIPPED" || ord.status === "DELIVERED"
                    ? "bg-blue-50 border-blue-100 text-blue-700"
                    : "bg-yellow-50 border-yellow-100 text-yellow-700"
                }`}>
                  {ord.status.replace(/_/g, " ")}
                </span>
                
                {isInspection && ord.inspectionEndsAt && (
                  <span className="block text-[10px] text-amber-600 font-bold mt-1.5 animate-pulse">
                    ⏱ 3-Day Inspection: {getCountdownText(ord.inspectionEndsAt)}
                  </span>
                )}
              </div>

              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Logistics & Tracking</span>
                {ord.courierName ? (
                  <div className="space-y-0.5 text-slate-800">
                    <span className="font-bold block">{ord.courierName}</span>
                    <span className="font-mono text-slate-500 block">ID: {ord.trackingId}</span>
                    {ord.trackingUrl && (
                      <a href={ord.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold block mt-1 flex items-center gap-0.5">
                        <Truck className="h-3.5 w-3.5" /> Direct Tracking Link <ArrowRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Not shipped yet.</span>
                )}
              </div>
            </div>

            {/* Actions / Alert Bars */}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              {/* Payment trigger if awaiting */}
              {ord.status === "AWAITING_PAYMENT" && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md flex gap-3 text-xs items-center justify-between">
                  <div className="flex gap-2.5 items-center">
                    <CreditCard className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900">Awaiting Wire / UPI Payment</h4>
                      <p className="mt-0.5 text-slate-600">Please submit transaction UTR receipt for verification.</p>
                    </div>
                  </div>
                  <Link
                    href={`/checkout/bulk/payment?orderId=${ord.id}`}
                    className="bg-amber-800 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded uppercase tracking-wider text-[10px] whitespace-nowrap"
                  >
                    Submit Payment
                  </Link>
                </div>
              )}

              {/* Payment verification pending status */}
              {ord.status === "PAYMENT_VERIFICATION" && (
                <div className="bg-slate-50 border border-slate-200 text-slate-600 p-4 rounded-md flex gap-3 text-xs items-center">
                  <CreditCard className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800">Neutral Payment Verification Pending</h4>
                    <p className="mt-0.5">Admins are cross-checking the ledger for UTR code: <strong>{ord.utr}</strong>.</p>
                  </div>
                </div>
              )}

              {/* 3-Day Inspection action trigger */}
              {isInspection && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md flex flex-col sm:flex-row gap-4 items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">Delivered! Under 3-Day Quality Inspection</h4>
                      <p className="mt-0.5 text-slate-600">
                        Check fabric weight (GSM), width, and color accuracy against sample before accepting.
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleAccept(ord.id)}
                        disabled={isPending}
                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded uppercase tracking-wider text-[10px] flex items-center justify-center gap-1 shadow"
                      >
                        <Check className="h-3 w-3" /> Accept Order
                      </button>
                      <button
                        onClick={() => setActiveDisputeOrderId(activeDisputeOrderId === ord.id ? null : ord.id)}
                        className="flex-1 sm:flex-none border border-red-200 text-red-700 bg-white hover:bg-red-50 font-bold px-4 py-2 rounded uppercase tracking-wider text-[10px] flex items-center justify-center gap-1 shadow-sm"
                      >
                        <AlertTriangle className="h-3 w-3" /> Raise Dispute
                      </button>
                    </div>
                  </div>

                  {/* Dispute submission drawer */}
                  {activeDisputeOrderId === ord.id && (
                    <form onSubmit={(e) => handleDispute(e, ord.id)} className="border border-red-200 bg-red-50/20 p-5 rounded-lg space-y-4">
                      <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-red-600" /> Log Quality Dispute
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-600 mb-1">Dispute Reason *</label>
                          <select
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            className="w-full border border-slate-300 rounded p-2 text-slate-900 bg-white"
                          >
                            <option value="Wrong fabric">Wrong fabric delivered</option>
                            <option value="Quantity shortage">Quantity shortage</option>
                            <option value="Material/specification mismatch">Material/specification mismatch</option>
                            <option value="Major colour mismatch">Major colour mismatch</option>
                            <option value="Damaged shipment">Damaged shipment</option>
                            <option value="Significant defects">Significant defects</option>
                            <option value="Other">Other reason</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-600 mb-1">Description & Evidence *</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Provide details about the defect, including measurements, GSM shortages, etc."
                            value={disputeDesc}
                            onChange={(e) => setDisputeDesc(e.target.value)}
                            className="w-full border border-slate-300 rounded p-2 text-slate-900"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={isPending}
                          className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-[10px] uppercase tracking-wider flex items-center gap-1 shadow"
                        >
                          Submit Dispute to Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDisputeOrderId(null);
                            setDisputeDesc("");
                          }}
                          className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Locked Dispute banner */}
              {ord.status === "DISPUTED" && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md flex gap-3 text-xs items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">Order Locked Under Dispute Review</h4>
                    <p className="mt-0.5">
                      TexSurat admin mediators are reviewing the submitted quality claim. Settlement values are locked.
                    </p>
                  </div>
                </div>
              )}

              {/* Reorder trigger */}
              {ord.status === "COMPLETED" && (
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded border border-slate-100 text-xs">
                  <span className="text-slate-500 font-semibold">Bulk Contract Completed. Need more?</span>
                  <Link
                    href={`/buyer/quotes/new?fabricId=${ord.fabricId}&reorder=1&prevQty=${ord.quantity}&prevPrice=${parseFloat(ord.pricePerUnit.toString()).toFixed(2)}`}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded uppercase tracking-wider text-[10px] shadow"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> REORDER
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
