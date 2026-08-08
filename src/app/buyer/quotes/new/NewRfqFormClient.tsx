"use client";

import React, { useActionState } from "react";
import { createRfqAction } from "../../../negotiations/actions";
import { Sparkles, Calendar, ShieldCheck, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface NewRfqFormProps {
  fabric: {
    id: string;
    name: string;
    slug: string;
    fabricId: string;
    price: any;
    moq: number;
    unit: string;
    supplier: {
      businessName: string;
      location: string;
    };
  };
  previouslySampled: boolean;
}

export default function NewRfqFormClient({ fabric, previouslySampled }: NewRfqFormProps) {
  const [state, formAction, isPending] = useActionState(createRfqAction, null);
  const searchParams = useSearchParams();
  
  const isReorder = searchParams.get("reorder") === "1";
  const prevQty = searchParams.get("prevQty");
  const prevPrice = searchParams.get("prevPrice");

  // Set min date to 7 days from now for realistic production lead times
  const getMinDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6 font-sans">
      {/* Fabric Card Context */}
      <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
        <div>
          <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-0.5">Sourcing Product</span>
          <span className="text-sm font-bold text-slate-900 block">{fabric.name}</span>
          <span className="text-slate-400 font-semibold mt-0.5">ID: {fabric.fabricId} | Supplier: {fabric.supplier.businessName}</span>
        </div>
        <div className="text-left sm:text-right">
          <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-0.5">Market Catalog Price</span>
          <span className="text-sm font-bold text-slate-900 block">₹{parseFloat(fabric.price.toString()).toFixed(2)}/m</span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Loom MOQ: {fabric.moq.toLocaleString()} metres</span>
        </div>
      </div>

      {/* Reorder Highlight Banner */}
      {isReorder && prevPrice && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md flex gap-3 text-xs items-center">
          <RefreshCw className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold">Reorder Sourcing Request</h4>
            <p className="mt-0.5 font-medium">
              Previous order terms: <strong className="text-slate-950">₹{prevPrice}/m</strong> for <strong className="text-slate-950">{parseFloat(prevQty || "0").toLocaleString()} metres</strong>. Note that pricing is subject to current loom schedules and yarn market shifts.
            </p>
          </div>
        </div>
      )}

      {/* Connection banner */}
      {previouslySampled && !isReorder && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-md flex gap-3 text-xs items-center">
          <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold">Sample Checked</h4>
            <p className="mt-0.5">
              You previously ordered and received a physical sample of this fabric. Sourcing confidence verified.
            </p>
          </div>
        </div>
      )}

      {/* RFQ Form */}
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="fabricId" value={fabric.id} />

        {state?.error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Target Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Quantity Needed *
            </label>
            <div className="relative mt-1">
              <input
                id="quantity"
                name="quantity"
                type="number"
                min={fabric.moq}
                defaultValue={prevQty ? parseInt(prevQty) : fabric.moq}
                required
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-slate-400 text-xs font-semibold">{fabric.unit}s</span>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Must be equal to or greater than the supplier's MOQ of {fabric.moq.toLocaleString()} {fabric.unit}s.
            </p>
          </div>

          {/* Unit */}
          <div>
            <label htmlFor="unit" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Measurement Unit
            </label>
            <input
              id="unit"
              name="unit"
              type="text"
              readOnly
              value={fabric.unit}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-500 bg-slate-50 shadow-sm sm:text-sm cursor-not-allowed"
            />
          </div>

          {/* Color Spec */}
          <div>
            <label htmlFor="color" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Color specification *
            </label>
            <input
              id="color"
              name="color"
              type="text"
              required
              placeholder="e.g. Jet Black, Custom Dye match"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Target Price */}
          <div>
            <label htmlFor="targetPrice" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Price Per Metre (₹) *
            </label>
            <input
              id="targetPrice"
              name="targetPrice"
              type="number"
              step="0.01"
              required
              placeholder={`Catalog price: ₹${parseFloat(fabric.price.toString()).toFixed(2)}`}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Delivery Location */}
          <div>
            <label htmlFor="deliveryLocation" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Delivery City / Destination *
            </label>
            <input
              id="deliveryLocation"
              name="deliveryLocation"
              type="text"
              required
              placeholder="e.g. Mumbai, Bangalore"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Required Delivery Date */}
          <div>
            <label htmlFor="requiredDeliveryDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Delivery Date *
            </label>
            <input
              id="requiredDeliveryDate"
              name="requiredDeliveryDate"
              type="date"
              min={getMinDeliveryDate()}
              required
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Requirements notes */}
          <div className="sm:col-span-2">
            <label htmlFor="requirements" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Special Loom or Processing Requirements (Optional)
            </label>
            <textarea
              id="requirements"
              name="requirements"
              rows={3}
              placeholder="Specify weave checks, roll packing sizing, customized selvedge lettering, shade verification or certifications."
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 justify-center rounded-md border border-transparent bg-slate-900 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
          >
            {isPending ? "Submitting Quote Request..." : "Request Quote & Start Negotiation"}
          </button>
          <Link
            href={`/fabrics/${fabric.slug}`}
            className="px-6 py-3 text-sm font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Back
          </Link>
        </div>
      </form>
    </div>
  );
}
