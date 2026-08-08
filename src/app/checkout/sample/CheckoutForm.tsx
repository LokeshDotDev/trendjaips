"use client";

import React, { useState, useActionState } from "react";
import { createSampleOrderAction } from "../actions";

interface CheckoutFormProps {
  fabric: {
    id: string;
    name: string;
    sampleOptions: Array<{
      id: string;
      name: string;
      size: string;
      price: any;
      description: string | null;
    }>;
  };
  buyerProfile: {
    businessName: string;
    contactName: string;
    location: string;
    address: string;
  };
}

export default function CheckoutForm({ fabric, buyerProfile }: CheckoutFormProps) {
  const [selectedOptionId, setSelectedOptionId] = useState(fabric.sampleOptions[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [state, formAction, isPending] = useActionState(createSampleOrderAction, null);

  const selectedOption = fabric.sampleOptions.find((opt) => opt.id === selectedOptionId);
  const price = selectedOption ? parseFloat(selectedOption.price.toString()) : 0;
  const shipping = 60.00;
  const total = (price * quantity) + shipping;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="fabricId" value={fabric.id} />

        {state?.error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        {/* Sample Selection */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Select Sample Details
          </h3>
          
          <div>
            <label htmlFor="sampleOptionId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Sample Size / Option
            </label>
            <div className="space-y-2">
              {fabric.sampleOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex justify-between items-start p-4 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedOptionId === opt.id
                      ? "border-blue-600 bg-blue-50/20"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="sampleOptionId"
                      value={opt.id}
                      checked={selectedOptionId === opt.id}
                      onChange={() => setSelectedOptionId(opt.id)}
                      className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500 mr-3"
                    />
                    <div>
                      <span className="block text-sm font-bold text-slate-900">{opt.name}</span>
                      <span className="block text-xs text-slate-500 mt-0.5">{opt.size} | {opt.description}</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">₹{opt.price.toString()}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="w-1/2">
            <label htmlFor="quantity" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-4 pt-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Shipping Address
          </h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="addressName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Recipient / Business Name *
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
                Contact Phone *
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
                Address Line 1 *
              </label>
              <input
                id="addressLine1"
                name="addressLine1"
                type="text"
                required
                defaultValue={buyerProfile.address}
                placeholder="e.g. 102, HSR Layout, Sector 3"
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
                placeholder="e.g. Suite 4"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="addressCity" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                City *
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

        {/* Pricing Summary Block */}
        <div className="border-t border-slate-200 pt-6 space-y-2">
          <div className="flex justify-between text-sm font-semibold text-slate-600">
            <span>Sample Price Subtotal</span>
            <span>₹{(price * quantity).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-slate-600">
            <span>Standard Shipping</span>
            <span>₹{shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-black text-slate-950 border-t border-slate-100 pt-2">
            <span>Order Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full justify-center rounded-md border border-transparent bg-slate-900 py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
        >
          {isPending ? "Creating Sample Order..." : "Proceed to Payment"}
        </button>
      </form>
    </div>
  );
}
