"use client";

import React, { useState, useTransition } from "react";
import { updateSampleOrderStateAction } from "../actions";
import { MapPin, Phone, User, Package, Calendar } from "lucide-react";

interface SampleOrder {
  id: string;
  quantity: number;
  samplePrice: any;
  shippingPrice: any;
  totalPrice: any;
  shippingAddressName: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingAddressCity: string;
  shippingAddressState: string;
  shippingAddressZip: string;
  shippingAddressPhone: string;
  status: string;
  utr: string | null;
  paymentScreenshotUrl: string | null;
  paymentStatus: string;
  courierName: string | null;
  trackingId: string | null;
  trackingUrl: string | null;
  createdAt: Date;
  buyer: {
    businessName: string;
    contactName: string;
  };
  fabric: {
    fabricId: string;
    name: string;
  };
}

export default function SampleRequestsClient({ initialOrders }: { initialOrders: SampleOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [isPending, startTransition] = useTransition();
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
      const result = await updateSampleOrderStateAction(id, newState, courier, tracking, url);
      if (result?.error) {
        alert(result.error);
      } else {
        alert(`Order state updated to ${newState.replace(/_/g, " ")}!`);
        // Update local state
        setOrders(
          orders.map((o) =>
            o.id === id
              ? { ...o, status: newState, courierName: courier || o.courierName, trackingId: tracking || o.trackingId, trackingUrl: url || o.trackingUrl }
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
                <span className="font-black text-slate-900 text-sm">{ord.id}</span>
                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Received: {new Date(ord.createdAt).toLocaleDateString()}
                </span>
              </div>
              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                ord.status === "COMPLETED"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                  : ord.status === "SHIPPED" || ord.status === "DELIVERED"
                  ? "bg-blue-50 border-blue-100 text-blue-700"
                  : ord.status === "CONFIRMED" || ord.status === "SUPPLIER_PREPARING"
                  ? "bg-yellow-50 border-yellow-100 text-yellow-700"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}>
                {ord.status.replace(/_/g, " ")}
              </span>
            </div>

            {/* Spec Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Fabric & Quantity</span>
                <span className="font-bold text-slate-900 block">{ord.fabric.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">ID: {ord.fabric.fabricId} | Quantity: {ord.quantity}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Shipping Details</span>
                <span className="font-semibold text-slate-950 block">{ord.shippingAddressName}</span>
                <span className="text-slate-600 block leading-relaxed">
                  {ord.shippingAddressLine1}, {ord.shippingAddressLine2 && `${ord.shippingAddressLine2}, `}
                  {ord.shippingAddressCity}, {ord.shippingAddressState} - {ord.shippingAddressZip}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block flex items-center gap-1">
                  <Phone className="h-3 w-3 text-slate-400" /> Phone: {ord.shippingAddressPhone}
                </span>
              </div>
            </div>

            {/* Shipping Inputs if preparing */}
            {ord.status === "SUPPLIER_PREPARING" && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                <span className="block text-[10px] text-slate-900 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Package className="h-4 w-4 text-slate-500" /> Courier & Tracking Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Courier Partner *</label>
                    <input
                      type="text"
                      placeholder="e.g. Delhivery"
                      value={couriers[ord.id] || ""}
                      onChange={(e) => setCouriers({ ...couriers, [ord.id]: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tracking Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. TRK12345"
                      value={trackingIds[ord.id] || ""}
                      onChange={(e) => setTrackingIds({ ...trackingIds, [ord.id]: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tracking URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://delhivery.com/track"
                      value={trackingUrls[ord.id] || ""}
                      onChange={(e) => setTrackingUrls({ ...trackingUrls, [ord.id]: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Courier display if already shipped */}
            {(ord.status === "SHIPPED" || ord.status === "DELIVERED" || ord.status === "COMPLETED") && ord.courierName && (
              <div className="text-xs border-t border-slate-100 pt-3 flex gap-4 text-slate-500">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Logistics</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{ord.courierName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tracking ID</span>
                  <span className="font-mono text-slate-900 block mt-0.5">{ord.trackingId}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action box */}
          <div className="flex flex-col justify-center h-full border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-2">
            {ord.status === "CONFIRMED" && (
              <button
                onClick={() => handleStateChange(ord.id, "SUPPLIER_PREPARING")}
                disabled={isPending}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded text-xs uppercase tracking-wider"
              >
                Mark Preparing
              </button>
            )}

            {ord.status === "SUPPLIER_PREPARING" && (
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

            {/* Waiting message for payments */}
            {(ord.status === "PAYMENT_PENDING" || ord.status === "PAYMENT_VERIFICATION") && (
              <div className="text-center p-3 bg-slate-50 border border-slate-100 rounded text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
                Awaiting Admin Payment Verification
              </div>
            )}

            {ord.status === "COMPLETED" && (
              <div className="text-center p-3 bg-emerald-50 border border-emerald-100 rounded text-[10px] text-emerald-700 font-bold leading-relaxed uppercase tracking-wider">
                Fulfillment Complete
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
