import React from "react";
import { db } from "@/lib/db";
import { FileText, ShieldCheck } from "lucide-react";
import FabricQueueClient from "./FabricQueueClient";

export default async function AdminFabricsPage() {
  const pendingFabrics = await db.fabric.findMany({
    where: { status: "PENDING_APPROVAL" },
    include: {
      supplier: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" /> Fabric Moderation
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Approve or reject new fabric catalogues uploaded by suppliers before they are displayed publicly.
        </p>
      </div>

      {pendingFabrics.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 space-y-2">
          <ShieldCheck className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No pending listings</h3>
          <p className="text-xs">All supplier fabrics are approved and live in the directory.</p>
        </div>
      ) : (
        <FabricQueueClient initialFabrics={pendingFabrics} />
      )}
    </div>
  );
}
