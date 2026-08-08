import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShoppingBag, ArrowRight, Truck, CreditCard, CheckCircle2, MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import BuyerSamplesTimeline from "./BuyerSamplesTimeline";

export default async function BuyerSamplesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "BUYER" || !user.buyerProfile) {
    redirect("/auth/login");
  }

  const profile = user.buyerProfile;

  // Fetch sample orders placed by buyer
  const sampleOrders = await db.sampleOrder.findMany({
    where: { buyerId: profile.id },
    include: {
      fabric: {
        include: { supplier: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-blue-600" /> My Physical Samples
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Track fabric swatches and cuts ordered to verify specifications and quality before purchasing bulk loomy batches.
        </p>
      </div>

      {sampleOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center text-slate-500 space-y-4 max-w-xl mx-auto">
          <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Sample Orders Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Order a small swatch or 1-metre cut to verify drape, handle, and colors before ordering bulk meters.
          </p>
          <Link
            href="/fabrics"
            className="inline-flex bg-slate-900 text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded hover:bg-slate-800"
          >
            Explore Fabrics
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {sampleOrders.map((ord) => (
            <div key={ord.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="font-black text-slate-900 text-sm">Order ID: {ord.id}</span>
                  <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                    Ordered: {new Date(ord.createdAt).toLocaleDateString()} | Supplier: {ord.fabric.supplier.businessName}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="font-black text-slate-950 text-sm block">Total: ₹{parseFloat(ord.totalPrice.toString()).toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Includes ₹60 flat shipping</span>
                </div>
              </div>

              {/* Fabric Specs */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Fabric & Option</span>
                  <Link href={`/fabrics/${ord.fabric.slug}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                    {ord.fabric.name}
                  </Link>
                  <span className="block text-slate-500 font-semibold mt-0.5">GSM: {ord.fabric.gsm} | Width: {ord.fabric.width}" | Qty: {ord.quantity}</span>
                </div>
                
                {/* Visual Status steppers info */}
                <div className="text-xs">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Logistics</span>
                  {ord.courierName ? (
                    <div className="space-y-0.5 text-slate-800">
                      <span className="font-bold block">{ord.courierName}</span>
                      <span className="font-mono text-slate-500 block">ID: {ord.trackingId}</span>
                      {ord.trackingUrl && (
                        <a href={ord.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold block mt-1 flex items-center gap-0.5">
                          <Truck className="h-3.5 w-3.5" /> Track Package <ArrowRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Tracking details will appear when shipped.</span>
                  )}
                </div>
              </div>

              {/* Progress Timeline Stepper */}
              <BuyerSamplesTimeline status={ord.status} />

              {/* Callouts and Prompts */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Prompt to submit payment if pending */}
                {ord.status === "PAYMENT_PENDING" && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md flex gap-3 text-xs items-center w-full">
                    <CreditCard className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div className="flex-grow">
                      <h4 className="font-bold">Awaiting Payment Submission</h4>
                      <p className="mt-0.5">Upload UTR and screenshot to verify transaction.</p>
                    </div>
                    <Link
                      href={`/checkout/sample/payment?orderId=${ord.id}`}
                      className="bg-amber-800 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded uppercase tracking-wider text-[10px]"
                    >
                      Pay Now
                    </Link>
                  </div>
                )}

                {/* Like this fabric? Prominent CTA to drive bulk quotes */}
                {(ord.status === "DELIVERED" || ord.status === "COMPLETED") && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md flex gap-4 items-center w-full justify-between">
                    <div className="flex gap-3 items-center">
                      <div className="bg-blue-100 text-blue-600 rounded-full p-2">
                        <MessageSquarePlus className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Like this fabric?</h4>
                        <p className="mt-0.5 text-xs text-slate-600">Start a private negotiation to source bulk quantities directly from the mill looms.</p>
                      </div>
                    </div>
                    <Link
                      href={`/buyer/quotes/new?fabricId=${ord.fabric.id}`}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded uppercase tracking-wider text-[10px] whitespace-nowrap"
                    >
                      Request Bulk Quote
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
