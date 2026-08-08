"use client";

import React, { useState, useActionState } from "react";
import { createSampleOrderAction } from "../actions";
import { Info } from "lucide-react";

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
  } | null;
  currentUser: any | null;
}

export default function CheckoutForm({ fabric, buyerProfile, currentUser }: CheckoutFormProps) {
  const [selectedOptionId, setSelectedOptionId] = useState(fabric.sampleOptions[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [state, formAction, isPending] = useActionState(createSampleOrderAction, null);

  const selectedOption = fabric.sampleOptions.find((opt) => opt.id === selectedOptionId);
  const price = selectedOption ? parseFloat(selectedOption.price.toString()) : 0;
  const shipping = 60.00;
  const total = (price * quantity) + shipping;

  return (
    <div className="bg-white border border-[#f0eae1] rounded-2xl p-6 shadow-sm">
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="fabricId" value={fabric.id} />

        {state?.error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-xs font-semibold text-red-700">{state.error}</p>
          </div>
        )}

        {/* 1. Select Sample Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-[#f2ece2] pb-2 font-serif uppercase tracking-wider">
            1. Select Sample Details
          </h3>
          
          <div>
            <label htmlFor="sampleOptionId" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Sample Cut / Size
            </label>
            <div className="space-y-2">
              {fabric.sampleOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex justify-between items-start p-4 rounded-xl border cursor-pointer hover:bg-[#faf8f5] transition-colors ${
                    selectedOptionId === opt.id
                      ? "border-[#b39b7d] bg-[#b39b7d]/5"
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
                      className="h-4 w-4 text-[#8c7457] border-slate-300 focus:ring-[#b39b7d] mr-3 cursor-pointer"
                    />
                    <div>
                      <span className="block text-sm font-bold text-slate-900">{opt.name}</span>
                      <span className="block text-xs text-slate-500 mt-0.5">{opt.size} | {opt.description}</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-950">₹{parseFloat(opt.price.toString()).toFixed(2)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="w-1/2">
            <label htmlFor="quantity" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-[#b39b7d] focus:outline-none focus:ring-1 focus:ring-[#b39b7d] text-sm font-medium"
            />
          </div>
        </div>

        {/* 2. Customer Credentials / Guest Account */}
        {!currentUser && (
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-[#f2ece2] pb-2 font-serif uppercase tracking-wider">
              2. Guest Contact Information
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="guestName" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Your Full Name *
                </label>
                <input
                  id="guestName"
                  name="guestName"
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-[#b39b7d] focus:outline-none focus:ring-1 focus:ring-[#b39b7d] text-sm font-medium"
                />
              </div>

              <div>
                <label htmlFor="guestEmail" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Email Address *
                </label>
                <input
                  id="guestEmail"
                  name="guestEmail"
                  type="email"
                  required
                  placeholder="e.g. designer@boutique.com"
                  className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-[#b39b7d] focus:outline-none focus:ring-1 focus:ring-[#b39b7d] text-sm font-medium"
                />
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-3 text-xs text-blue-700 leading-relaxed font-semibold">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <div>
                <h4 className="font-bold mb-0.5">Automated B2B Account Creation</h4>
                <p>
                  A secure buyer profile will be created automatically for this email to track sample test updates and negotiations. You can set a secure login password immediately after placing your order.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Shipping Address */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-[#f2ece2] pb-2 font-serif uppercase tracking-wider">
            {currentUser ? "2. Shipping Address" : "3. Shipping Address"}
          </h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="addressName" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Recipient / Business Name *
              </label>
              <input
                id="addressName"
                name="addressName"
                type="text"
                required
                defaultValue={buyerProfile?.businessName || ""}
                placeholder="e.g. Aria Designs Studio"
                className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-[#b39b7d] focus:outline-none focus:ring-1 focus:ring-[#b39b7d] text-sm font-medium"
              />
            </div>

            <div>
              <label htmlFor="addressPhone" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Contact Phone *
              </label>
              <input
                id="addressPhone"
                name="addressPhone"
                type="tel"
                required
                placeholder="e.g. 9876543210"
                className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-[#b39b7d] focus:outline-none focus:ring-1 focus:ring-[#b39b7d] text-sm font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="addressLine1" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Address Line 1 *
              </label>
              <input
                id="addressLine1"
                name="addressLine1"
                type="text"
                required
                defaultValue={buyerProfile?.address || ""}
                placeholder="e.g. Studio 4B, Colaba Causeway, Behind HDFC Bank"
                className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-[#b39b7d] focus:outline-none focus:ring-1 focus:ring-[#b39b7d] text-sm font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="addressLine2" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Address Line 2 (Optional)
              </label>
              <input
                id="addressLine2"
                name="addressLine2"
                type="text"
                placeholder="e.g. Suite 4"
                className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-[#b39b7d] focus:outline-none focus:ring-1 focus:ring-[#b39b7d] text-sm font-medium"
              />
            </div>

            <div>
              <label htmlFor="addressCity" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                City *
              </label>
              <input
                id="addressCity"
                name="addressCity"
                type="text"
                required
                defaultValue={buyerProfile?.location.split(",")[0]?.trim() || ""}
                placeholder="e.g. Mumbai"
                className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-[#b39b7d] focus:outline-none focus:ring-1 focus:ring-[#b39b7d] text-sm font-medium"
              />
            </div>

            <div>
              <label htmlFor="addressState" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                State *
              </label>
              <input
                id="addressState"
                name="addressState"
                type="text"
                required
                defaultValue={buyerProfile?.location.split(",")[1]?.trim() || ""}
                placeholder="e.g. Maharashtra"
                className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-[#b39b7d] focus:outline-none focus:ring-1 focus:ring-[#b39b7d] text-sm font-medium"
              />
            </div>

            <div>
              <label htmlFor="addressZip" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                ZIP / Postal Code *
              </label>
              <input
                id="addressZip"
                name="addressZip"
                type="text"
                required
                placeholder="e.g. 400005"
                className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-[#b39b7d] focus:outline-none focus:ring-1 focus:ring-[#b39b7d] text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="border-t border-[#f2ece2] pt-6 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Sample Subtotal</span>
            <span>₹{(price * quantity).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Standard Shipping</span>
            <span>₹{shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-black text-slate-950 border-t border-[#f2ece2] pt-2 font-sans">
            <span>Order Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full justify-center rounded-md border border-transparent bg-slate-950 py-4 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#8c7457] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isPending ? "Creating Sample Order..." : "Proceed to Payment"}
        </button>
      </form>
    </div>
  );
}
