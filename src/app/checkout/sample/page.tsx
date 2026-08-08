import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import CheckoutForm from "./CheckoutForm";

interface CheckoutPageProps {
  searchParams: Promise<{ fabricId?: string }>;
}

export default async function CheckoutSamplePage({ searchParams }: CheckoutPageProps) {
  const currentUser = await getCurrentUser();
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
      <div className="md:flex md:items-center md:justify-between mb-8 border-b border-[#f2ece2] pb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 font-serif">
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
          <CheckoutForm 
            fabric={fabric} 
            buyerProfile={currentUser?.buyerProfile || null} 
            currentUser={currentUser}
          />
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-4 bg-white border border-[#f0eae1] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-[#f2ece2] pb-2 font-sans">
            Selected Fabric
          </h3>
          <div className="flex items-center gap-3">
            {fabric.images?.[0] && (
              <img src={fabric.images[0].url} alt={fabric.name} className="h-16 w-16 object-cover rounded-lg border border-[#f2ece2] bg-[#faf8f5]" />
            )}
            <div>
              <h4 className="text-sm font-bold text-slate-900 line-clamp-1 font-serif">{fabric.name}</h4>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">GSM: {fabric.gsm} | ID: {fabric.fabricId}</p>
            </div>
          </div>

          <div className="border-t border-[#f2ece2] pt-4 space-y-2 text-xs font-medium">
            <div className="flex justify-between text-slate-500">
              <span>Delivery Method</span>
              <span className="text-slate-900 font-bold">Standard Shipping</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Origin City</span>
              <span className="text-slate-900 font-bold">{fabric.supplier.location}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Standard Charge</span>
              <span className="text-slate-900 font-bold">₹60.00 Flat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
