import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Star, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function BuyerSavedPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "BUYER" || !user.buyerProfile) {
    redirect("/auth/login");
  }

  const profile = user.buyerProfile;

  // Fetch saved items
  const savedFabrics = await db.savedFabric.findMany({
    where: { buyerId: profile.id },
    include: { fabric: { include: { supplier: true } } },
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Star className="h-6 w-6 text-blue-600" /> Saved Items
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Your bookmarked fabrics and favorite Surat mills.
        </p>
      </div>

      {savedFabrics.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center text-slate-500 space-y-4 max-w-xl mx-auto">
          <Star className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Saved Items</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Bookmark fabrics while browsing the directory to quickly access them later for physical samples or RFQs.
          </p>
          <Link
            href="/fabrics"
            className="inline-flex bg-slate-900 text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded hover:bg-slate-800"
          >
            Explore Fabrics
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {savedFabrics.map(({ fabric }) => (
            <div key={fabric.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-widest">{fabric.fabricId}</span>
                  <span className="font-bold text-slate-900">₹{parseFloat(fabric.price.toString()).toFixed(2)}/m</span>
                </div>
                <h3 className="font-bold text-slate-900 line-clamp-1">{fabric.name}</h3>
                <div className="text-xs flex items-center justify-between border-t border-slate-100 pt-3">
                  <span>Mill: {fabric.supplier.businessName}</span>
                  {fabric.supplier.status === "VERIFIED" && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5 pt-0">
                <Link
                  href={`/fabrics/${fabric.slug}`}
                  className="block w-full text-center py-2 text-xs font-bold rounded-md bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                >
                  View Fabric
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
