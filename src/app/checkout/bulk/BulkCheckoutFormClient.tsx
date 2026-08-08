"use client";

import React, { useActionState } from "react";
import { createBulkOrderAction } from "../bulk-actions";
import Link from "next/link";

interface BulkCheckoutFormProps {
  offer: {
    id: string;
    negotiationId: string;
  };
  buyerProfile: {
    businessName: string;
    address: string;
    location: string;
  };
}

export default function BulkCheckoutFormClient({ offer, buyerProfile }: BulkCheckoutFormProps) {
  const [state, formAction, isPending] = useActionState(createBulkOrderAction, null);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="offerId" value={offer.id} />

        {state?.error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Loom Batch Delivery Destination
          </h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="addressName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Recipient / Corporate Name *
              </label>
              <input
                id="addressName"
                name="addressName"
                type="text"
                required
                defaultValue={buyerProfile.businessName}
                placeholder="e.g. Zara Fashion Labs"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="addressPhone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Warehouse Contact Phone *
              </label>
              <input
                id="addressPhone"
                name="addressPhone"
                type="tel"
                required
                placeholder="e.g. 9876543210"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="addressLine1" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Destination Address Line 1 *
              </label>
              <input
                id="addressLine1"
                name="addressLine1"
                type="text"
                required
                defaultValue={buyerProfile.address}
                placeholder="e.g. Warehouse 10A, Industrial Estate"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="addressLine2" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Address Line 2 (Optional)
              </label>
              <input
                id="addressLine2"
                name="addressLine2"
                type="text"
                placeholder="e.g. Behind Toll Plaza"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="addressCity" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Destination City *
              </label>
              <input
                id="addressCity"
                name="addressCity"
                type="text"
                required
                defaultValue={buyerProfile.location.split(",")[0]?.trim() || ""}
                placeholder="e.g. Bangalore"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="addressState" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                State *
              </label>
              <input
                id="addressState"
                name="addressState"
                type="text"
                required
                defaultValue={buyerProfile.location.split(",")[1]?.trim() || ""}
                placeholder="e.g. Karnataka"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="addressZip" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                ZIP / Postal Code *
              </label>
              <input
                id="addressZip"
                name="addressZip"
                type="text"
                required
                placeholder="e.g. 560102"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-4 pt-6 border-t border-slate-200">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 justify-center rounded-md border border-transparent bg-slate-900 py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
          >
            {isPending ? "Generating Bulk Order Invoice..." : "Confirm & Proceed to Payment"}
          </button>
          <Link
            href={`/negotiations/${offer.negotiationId}`}
            className="px-6 py-3 text-sm font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Back to Room
          </Link>
        </div>
      </form>
    </div>
  );
}
