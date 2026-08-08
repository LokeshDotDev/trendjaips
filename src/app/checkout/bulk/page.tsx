import React from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import BulkCheckoutFormClient from "./BulkCheckoutFormClient";

interface BulkCheckoutPageProps {
  searchParams: Promise<{ offerId?: string }>;
}

export default async function BulkCheckoutPage({ searchParams }: BulkCheckoutPageProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "BUYER" || !currentUser.buyerProfile) {
    redirect("/auth/login?callbackUrl=/checkout/bulk");
  }

  const params = await searchParams;
  const offerId = params.offerId;

  if (!offerId) {
    notFound();
  }

  // Load accepted offer terms
  const offer = await db.offer.findUnique({
    where: { id: offerId, status: "ACCEPTED" },
    include: {
      negotiation: {
        include: {
          rfq: {
            include: { fabric: true },
          },
        },
      },
    },
  });

  if (!offer) {
    notFound();
  }

  const fabric = offer.negotiation.rfq.fabric;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full font-sans">
      <div className="border-b border-slate-200 pb-5 mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Confirm Bulk Order</h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Verify frozen negotiated terms and submit delivery details to request loom run invoicing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-8">
          <BulkCheckoutFormClient offer={offer} buyerProfile={currentUser.buyerProfile} />
        </div>

        {/* Right commercial terms card snapshot */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Negotiated Terms Snapshot
          </h3>
          <div className="space-y-3 text-xs text-slate-600">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Fabric</span>
              <span className="font-bold text-slate-900 block mt-0.5">{fabric.name}</span>
              <span className="block text-[10px] mt-0.5">Fabric ID: {fabric.fabricId}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Price / Metre</span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">₹{parseFloat(offer.pricePerMetre.toString()).toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Quantity</span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">{offer.quantity.toLocaleString()} m</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Loom Lead Time</span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">{offer.productionDays} Days</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Offer Reference</span>
                <span className="font-mono text-slate-900 mt-0.5 block">{offer.id}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 font-semibold">
                <span>Subtotal</span>
                <span>₹{parseFloat(offer.subtotal.toString()).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-semibold">
                <span>Negotiated Shipping</span>
                <span>₹{parseFloat(offer.shippingCharge.toString()).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 border-t border-slate-100 pt-2.5">
                <span>Contract Total</span>
                <span>₹{parseFloat(offer.total.toString()).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
