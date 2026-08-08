import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import CheckoutForm from "./CheckoutForm";

interface CheckoutPageProps {
  searchParams: Promise<{ fabricId?: string }>;
}

export default async function CheckoutSamplePage({ searchParams }: CheckoutPageProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "BUYER" || !currentUser.buyerProfile) {
    redirect("/auth/login?callbackUrl=/checkout/sample");
  }

  const params = await searchParams;
  const fabricId = params.fabricId;

  if (!fabricId) {
    notFound();
  }

  const fabric = await db.fabric.findUnique({
    where: { id: fabricId, status: "PUBLISHED" },
    include: {
      sampleOptions: true,
      supplier: true,
      images: true,
    },
  });

  if (!fabric) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full font-sans">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-extrabold leading-7 text-slate-900 sm:text-3xl sm:truncate">
            Order Physical Fabric Sample
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Test the texture, GSM weight, and hand-feel before committing to a bulk loom run.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-8">
          <CheckoutForm fabric={fabric} buyerProfile={currentUser.buyerProfile} />
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Selected Fabric
          </h3>
          <div className="flex items-center gap-3">
            {fabric.images?.[0] && (
              <img src={fabric.images[0].url} alt={fabric.name} className="h-14 w-14 object-cover rounded border" />
            )}
            <div>
              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{fabric.name}</h4>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">GSM: {fabric.gsm} | ID: {fabric.fabricId}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Delivery Method</span>
              <span className="text-slate-900 font-semibold">Standard Shipping</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Origin City</span>
              <span className="text-slate-900 font-semibold">{fabric.supplier.location}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Standard Charge</span>
              <span className="text-slate-900 font-semibold">₹60.00 Flat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
