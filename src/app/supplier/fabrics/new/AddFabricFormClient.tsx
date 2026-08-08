"use client";

import React, { useActionState } from "react";
import { addFabricAction } from "../../actions";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

export default function AddFabricFormClient({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(addFabricAction, null);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Fabric Name */}
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Fabric Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Premium Heavy Viscose Satin"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="categoryId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Category *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm bg-white"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Material */}
          <div>
            <label htmlFor="material" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Base Material *
            </label>
            <input
              id="material"
              name="material"
              type="text"
              required
              placeholder="e.g. Viscose, Cotton, Polyester"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Pricing per Metre */}
          <div>
            <label htmlFor="price" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Approx Price Per Metre (₹) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              required
              placeholder="e.g. 78.50"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Unit */}
          <div>
            <label htmlFor="unit" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Sale Unit
            </label>
            <input
              id="unit"
              name="unit"
              type="text"
              defaultValue="metre"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* MOQ */}
          <div>
            <label htmlFor="moq" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Minimum Order Quantity (MOQ) *
            </label>
            <input
              id="moq"
              name="moq"
              type="number"
              required
              placeholder="e.g. 500"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* GSM */}
          <div>
            <label htmlFor="gsm" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Fabric Weight (GSM) *
            </label>
            <input
              id="gsm"
              name="gsm"
              type="number"
              required
              placeholder="e.g. 140"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Width */}
          <div>
            <label htmlFor="width" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Loom Width (inches) *
            </label>
            <input
              id="width"
              name="width"
              type="number"
              required
              placeholder="e.g. 44 or 58"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Composition */}
          <div>
            <label htmlFor="composition" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Yarn Composition *
            </label>
            <input
              id="composition"
              name="composition"
              type="text"
              required
              placeholder="e.g. 100% Viscose, 80/20 Cotton Poly"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Stretch */}
          <div>
            <label htmlFor="stretch" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Stretch
            </label>
            <input
              id="stretch"
              name="stretch"
              type="text"
              defaultValue="Non-stretch"
              placeholder="e.g. 4-way stretch, Mechanical"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Finish */}
          <div>
            <label htmlFor="finish" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Fabric Finish
            </label>
            <input
              id="finish"
              name="finish"
              type="text"
              defaultValue="Regular"
              placeholder="e.g. Mercerized, Soft Matte"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Pattern */}
          <div>
            <label htmlFor="pattern" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Weave Pattern
            </label>
            <input
              id="pattern"
              name="pattern"
              type="text"
              defaultValue="Solid"
              placeholder="e.g. Twill, Plain, Jacquard"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Lead Time */}
          <div>
            <label htmlFor="productionTime" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Production Lead Time (days) *
            </label>
            <input
              id="productionTime"
              name="productionTime"
              type="number"
              required
              placeholder="e.g. 15"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Colors */}
          <div className="sm:col-span-2">
            <label htmlFor="colors" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Available Colors (comma separated)
            </label>
            <input
              id="colors"
              name="colors"
              type="text"
              placeholder="e.g. Jet Black, Pure White, Royal Blue"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Use Cases */}
          <div className="sm:col-span-2">
            <label htmlFor="useCases" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Suitable Applications / Use Cases (comma separated)
            </label>
            <input
              id="useCases"
              name="useCases"
              type="text"
              placeholder="e.g. Digital printing, Garments, Kurtis, Sarees"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Fabric Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="Mention details about the weave feel, shrinkage behavior, color fastness, printing compatibility, and other properties."
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Notice on Sample options */}
        <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs text-slate-600 leading-relaxed">
          <strong>Physical Samples Note:</strong> The platform will automatically set up standard sample options (1 Metre Cut, Large Swatch 50x50cm, Standard Swatch 20x20cm) linked to your price. Buyers can order these immediately once approved.
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 justify-center rounded-md border border-transparent bg-slate-900 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
          >
            {isPending ? "Submitting Listing..." : "Submit Fabric for Moderation"}
          </button>
          <Link
            href="/supplier/fabrics"
            className="px-6 py-3 text-sm font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
