"use client";

import React, { useState, useTransition } from "react";
import { resolveDisputeAction } from "../actions";
import { ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

interface Dispute {
  id: string;
  orderId: string;
  raisedBy: string;
  reason: string;
  description: string;
  status: string;
  adminNotes: string | null;
  createdAt: Date;
  order: {
    total: any;
    buyer: { businessName: string };
    supplier: { businessName: string };
  };
}

export default function DisputeQueueClient({ initialDisputes }: { initialDisputes: Dispute[] }) {
  const [disputes, setDisputes] = useState(initialDisputes);
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  const handleResolve = (disputeId: string, resolution: "RESOLVED_BUYER" | "RESOLVED_SUPPLIER") => {
    const adminNote = notes[disputeId] || "";
    const text = resolution === "RESOLVED_BUYER" ? "BUYER (Refund pending)" : "SUPPLIER (Complete order)";
    
    if (!confirm(`Are you sure you want to resolve this dispute in favor of ${text}?`)) {
      return;
    }

    startTransition(async () => {
      const res = await resolveDisputeAction(disputeId, resolution, adminNote);
      if (res.error) {
        alert(res.error);
      } else {
        alert("Dispute resolved successfully!");
        setDisputes(
          disputes.map((d) =>
            d.id === disputeId
              ? {
                  ...d,
                  status: resolution,
                  adminNotes: adminNote || `Resolved in favor of ${resolution.split("_")[1]}.`,
                }
              : d
          )
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {disputes.map((disp) => (
        <div key={disp.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-start font-sans">
          <div className="md:col-span-3 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black text-slate-900 text-sm">Dispute ID: {disp.id}</span>
                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  disp.status === "OPEN"
                    ? "bg-red-50 border-red-100 text-red-700"
                    : "bg-emerald-50 border-emerald-100 text-emerald-700"
                }`}>
                  {disp.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">
                Raised: {new Date(disp.createdAt).toLocaleDateString()} | Contract: {disp.orderId}
              </p>
            </div>

            <div className="text-xs space-y-2 border-t border-slate-100 pt-3 text-slate-600">
              <p>
                <strong className="text-slate-900 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Dispute Reason:</strong>
                <span className="font-extrabold text-red-700">{disp.reason}</span>
              </p>
              <p className="leading-relaxed">
                <strong className="text-slate-900 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Details:</strong>
                {disp.description}
              </p>
              
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-50 mt-2">
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Buyer</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">{disp.order.buyer.businessName}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Supplier</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">{disp.order.supplier.businessName}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Order Value</span>
                  <span className="font-extrabold text-slate-950 block mt-0.5">₹{parseFloat(disp.order.total.toString()).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center h-full border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-2">
            {disp.status === "OPEN" ? (
              <>
                <textarea
                  placeholder="Admin arbitration notes..."
                  value={notes[disp.id] || ""}
                  onChange={(e) => setNotes({ ...notes, [disp.id]: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none"
                  rows={2}
                />
                <button
                  onClick={() => handleResolve(disp.id, "RESOLVED_BUYER")}
                  disabled={isPending}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded text-xs uppercase tracking-wider"
                >
                  Resolve for Buyer
                </button>
                <button
                  onClick={() => handleResolve(disp.id, "RESOLVED_SUPPLIER")}
                  disabled={isPending}
                  className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2 rounded text-xs uppercase tracking-wider bg-white"
                >
                  Resolve for Supplier
                </button>
              </>
            ) : (
              <div className="bg-slate-50 p-4 border border-slate-100 rounded text-xs text-slate-500 font-medium">
                <span className="block font-bold text-slate-800 flex items-center gap-1 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Resolved Notes:
                </span>
                {disp.adminNotes}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
