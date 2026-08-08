import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Plus, Scissors, ShieldAlert, BadgeCheck, Loader2 } from "lucide-react";

export default async function SupplierFabricsPage() {
  const user = await getCurrentUser();
  const profile = user!.supplierProfile!;

  // Fetch supplier fabrics
  const fabrics = await db.fabric.findMany({
    where: { supplierId: profile.id },
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Scissors className="h-6 w-6 text-blue-600" /> My Fabrics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Manage your catalogue listings and loom specifications.
          </p>
        </div>

        {profile.status === "VERIFIED" && (
          <Link
            href="/supplier/fabrics/new"
            className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded text-xs uppercase tracking-wider shadow-sm transition-colors self-start"
          >
            <Plus className="h-4 w-4" /> Add New Fabric
          </Link>
        )}
      </div>

      {fabrics.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center text-slate-500 space-y-4 max-w-xl mx-auto">
          <Scissors className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Your Loom Catalogue is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {profile.status === "VERIFIED"
              ? "Start listing your weaves. Buyers will see your fabrics in the marketplace once approved by moderation."
              : "Your account is pending verification. You can list fabrics once approved by administration."}
          </p>
          {profile.status === "VERIFIED" && (
            <Link
              href="/supplier/fabrics/new"
              className="inline-flex bg-slate-900 text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded hover:bg-slate-800"
            >
              Add Your First Fabric
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Fabric Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Price per Metre</th>
                <th className="px-6 py-4 text-right">MOQ</th>
                <th className="px-6 py-4">Specifications</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {fabrics.map((fab) => (
                <tr key={fab.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <Link href={`/fabrics/${fab.slug}`} className="font-bold text-slate-900 hover:text-blue-600 block">
                      {fab.name}
                    </Link>
                    <span className="block text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest">
                      ID: {fab.fabricId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                      {fab.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                    <span>₹{parseFloat(fab.price.toString()).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                    <span>{fab.moq.toLocaleString()} m</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 space-y-0.5 text-[10px]">
                    <span className="block">GSM: {fab.gsm}</span>
                    <span className="block">Width: {fab.width} inches</span>
                    <span className="block">Lead Time: {fab.productionTime} days</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      fab.status === "PUBLISHED"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : fab.status === "PENDING_APPROVAL"
                        ? "bg-yellow-50 border-yellow-100 text-yellow-700"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}>
                      {fab.status === "PENDING_APPROVAL" && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                      {fab.status === "PUBLISHED" && <BadgeCheck className="h-2.5 w-2.5" />}
                      {fab.status === "REJECTED" && <ShieldAlert className="h-2.5 w-2.5" />}
                      {fab.status.replace(/_/g, " ")}
                    </span>
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
