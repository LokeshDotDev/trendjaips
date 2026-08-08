"use client";

import React, { useState, useTransition } from "react";
import { updateBulkOrderStateAction } from "../../checkout/bulk-actions";
import { Package, Truck, Phone, AlertCircle, ShieldCheck, Check, Calendar } from "lucide-react";

interface BulkOrder {
  id: string;
  fabricNameSnapshot: string;
  fabricIdSnapshot: string;
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
  createdAt: Date;
  buyer: {
    businessName: string;
    contactName: string;
    address: string;
    location: string;
  };
}

export default function SupplierOrdersClient({ initialOrders }: { initialOrders: BulkOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [isPending, startTransition] = useTransition();

  // Courier inputs
  const [couriers, setCouriers] = useState<{ [key: string]: string }>({});
  const [trackingIds, setTrackingIds] = useState<{ [key: string]: string }>({});
  const [trackingUrls, setTrackingUrls] = useState<{ [key: string]: string }>({});

  const handleStateChange = (id: string, newState: any) => {
    const courier = couriers[id] || "";
    const tracking = trackingIds[id] || "";
    const url = trackingUrls[id] || "";

    if (newState === "SHIPPED" && (!courier.trim() || !tracking.trim())) {
      alert("Please provide the Courier Name and Tracking ID to mark as shipped.");
      return;
    }

    startTransition(async () => {
      const result = await updateBulkOrderStateAction(id, newState, courier, tracking, url);
      if (result?.error) {
        alert(result.error);
      } else {
        alert(`Order state successfully updated to ${newState.replace(/_/g, " ")}!`);
        // Refresh local state
        setOrders(
          orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status: newState,
                  courierName: courier || o.courierName,
                  trackingId: tracking || o.trackingId,
                  trackingUrl: url || o.trackingUrl,
                }
              : o
          )
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {orders.map((ord) => (
        <div key={ord.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-start font-sans">
          <div className="md:col-span-3 space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-3 justify-between">
              <div>
                <span className="font-black text-slate-900 text-sm">Contract ID: {ord.id}</span>
                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Received: {new Date(ord.createdAt).toLocaleDateString()}
                </span>
              </div>
              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                ord.status === "COMPLETED"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                  : ord.status === "SHIPPED" || ord.status === "DELIVERED"
                  ? "bg-blue-50 border-blue-100 text-blue-700"
                  : ord.status === "PAID" || ord.status === "PROCESSING" || ord.status === "READY_TO_SHIP"
                  ? "bg-yellow-50 border-yellow-100 text-yellow-700"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}>
                {ord.status.replace(/_/g, " ")}
              </span>
            </div>

            {/* Spec details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Fabric & Quantity</span>
                <span className="font-bold text-slate-900 block">{ord.fabricNameSnapshot}</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Loom ID: {ord.fabricIdSnapshot}</span>
                <span className="text-slate-800 font-bold block mt-1.5">
                  ₹{parseFloat(ord.pricePerUnit.toString()).toFixed(2)}/m × {ord.quantity.toLocaleString()} {ord.unit}s
                </span>
                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                  Subtotal: ₹{parseFloat(ord.subtotal.toString()).toLocaleString()} | Ship: ₹{parseFloat(ord.shipping.toString()).toLocaleString()}
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Buyer Consignee</span>
                <span className="font-bold text-slate-950 block">{ord.buyer.businessName}</span>
                <span className="text-slate-600 block leading-relaxed mt-0.5">
                  {ord.buyer.address}, {ord.buyer.location}
                </span>
              </div>
            </div>

            {/* Shipping Inputs if ready to ship */}
            {ord.status === "READY_TO_SHIP" && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                <span className="block text-[10px] text-slate-900 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Package className="h-4 w-4 text-slate-500" /> Dispatch Cargo Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Courier / Transporter *</label>
                    <input
                      type="text"
                      placeholder="e.g. V-Trans Logistics"
                      value={couriers[ord.id] || ""}
                      onChange={(e) => setCouriers({ ...couriers, [ord.id]: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tracking Number / LR No *</label>
                    <input
                      type="text"
                      placeholder="e.g. LRN883921"
                      value={trackingIds[ord.id] || ""}
                      onChange={(e) => setTrackingIds({ ...trackingIds, [ord.id]: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tracking URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://vtransgroup.com"
                      value={trackingUrls[ord.id] || ""}
                      onChange={(e) => setTrackingUrls({ ...trackingUrls, [ord.id]: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Courier display if already shipped */}
            {(ord.status === "SHIPPED" || ord.status === "DELIVERED" || ord.status === "COMPLETED") && ord.courierName && (
              <div className="text-xs border-t border-slate-100 pt-3 flex gap-4 text-slate-500">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Logistics Transporter</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{ord.courierName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tracking / LR Number</span>
                  <span className="font-mono text-slate-900 block mt-0.5">{ord.trackingId}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action boxes */}
          <div className="flex flex-col justify-center h-full border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-2">
            {/* Warning block if unpaid */}
            {(ord.status === "AWAITING_PAYMENT" || ord.status === "PAYMENT_VERIFICATION" || ord.status === "QUOTE_ACCEPTED") && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-[10px] font-bold leading-relaxed uppercase tracking-wider text-center flex flex-col gap-1">
                <AlertCircle className="h-4 w-4 text-red-600 mx-auto" />
                <span>Hold Production</span>
                <span className="text-[8px] font-normal lowercase tracking-normal text-slate-500">Do not fulfill. Awaiting Admin payment confirmation.</span>
              </div>
            )}

            {ord.status === "PAID" && (
              <button
                onClick={() => handleStateChange(ord.id, "PROCESSING")}
                disabled={isPending}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded text-xs uppercase tracking-wider"
              >
                Start Processing
              </button>
            )}

            {ord.status === "PROCESSING" && (
              <button
                onClick={() => handleStateChange(ord.id, "READY_TO_SHIP")}
                disabled={isPending}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded text-xs uppercase tracking-wider"
              >
                Mark Ready to Ship
              </button>
            )}

            {ord.status === "READY_TO_SHIP" && (
              <button
                onClick={() => handleStateChange(ord.id, "SHIPPED")}
                disabled={isPending}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded text-xs uppercase tracking-wider"
              >
                Mark Shipped
              </button>
            )}

            {ord.status === "SHIPPED" && (
              <button
                onClick={() => handleStateChange(ord.id, "DELIVERED")}
                disabled={isPending}
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded text-xs uppercase tracking-wider"
              >
                Mark Delivered
              </button>
            )}

            {ord.status === "DELIVERED" && (
              <div className="text-center p-3 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-700 font-bold leading-relaxed uppercase tracking-wider">
                Under Inspection
              </div>
            )}

            {ord.status === "COMPLETED" && (
              <div className="text-center p-3 bg-emerald-50 border border-emerald-100 rounded text-[10px] text-emerald-700 font-bold leading-relaxed uppercase tracking-wider flex flex-col gap-0.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 mx-auto" />
                <span>Order Completed</span>
              </div>
            )}

            {ord.status === "DISPUTED" && (
              <div className="text-center p-3 bg-red-950 border border-red-900 rounded text-[10px] text-red-100 font-bold leading-relaxed uppercase tracking-wider flex flex-col gap-0.5">
                <AlertCircle className="h-4 w-4 text-red-400 mx-auto" />
                <span>Quality Claim</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
