import React from "react";
import { db } from "@/lib/db";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import DisputeQueueClient from "./DisputeQueueClient";

export default async function AdminDisputesPage() {
  // Fetch disputes
  const disputes = await db.dispute.findMany({
    include: {
      order: {
        include: {
          buyer: true,
          supplier: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-600" /> Sourcing Disputes
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5 font-medium">
          Arbitrate and resolve quality or quantity mismatch claims raised by buyers during inspection window.
        </p>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 space-y-2 max-w-xl mx-auto">
          <ShieldCheck className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Clear Records</h3>
          <p className="text-xs">No active buyer quality dispute claims raised.</p>
        </div>
      ) : (
        <DisputeQueueClient initialDisputes={disputes} />
      )}
    </div>
  );
}
