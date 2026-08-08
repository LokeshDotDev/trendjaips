"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import { registerAction } from "../actions";

export default function RegisterPage() {
  const [role, setRole] = useState<"BUYER" | "SUPPLIER">("BUYER");
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <Link href="/" className="flex justify-center items-center gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900">
            TEX<span className="text-blue-600">SURAT</span>
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Create your business account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{" "}
          <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          {/* Role selector */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Your Role</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("BUYER")}
                className={`py-3 px-4 text-center rounded-lg border font-semibold text-sm transition-all focus:outline-none ${
                  role === "BUYER"
                    ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                I am a Fabric Buyer
                <span className="block text-xs font-normal opacity-85 mt-0.5">
                  Designer, Boutique, Brand, Printer
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole("SUPPLIER")}
                className={`py-3 px-4 text-center rounded-lg border font-semibold text-sm transition-all focus:outline-none ${
                  role === "SUPPLIER"
                    ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                I am a Surat Supplier
                <span className="block text-xs font-normal opacity-85 mt-0.5">
                  Manufacturer, Trader, Wholesaler
                </span>
              </button>
            </div>
          </div>

          <form action={formAction} className="space-y-6">
            <input type="hidden" name="role" value={role} />

            {state?.error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
                  Account Credentials
                </h3>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email address *
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password *
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2 mt-4">
                  Business Information
                </h3>
              </div>

              <div>
                <label htmlFor="businessName" className="block text-sm font-semibold text-slate-700">
                  Business Name *
                </label>
                <div className="mt-1">
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    placeholder="e.g. Surat Fabrics Co."
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contactName" className="block text-sm font-semibold text-slate-700">
                  Contact Person Name *
                </label>
                <div className="mt-1">
                  <input
                    id="contactName"
                    name="contactName"
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="businessType" className="block text-sm font-semibold text-slate-700">
                  Business Type *
                </label>
                <div className="mt-1">
                  <input
                    id="businessType"
                    name="businessType"
                    type="text"
                    required
                    placeholder={role === "SUPPLIER" ? "e.g. Textile Manufacturer" : "e.g. D2C Fashion Brand"}
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-slate-700">
                  City / State *
                </label>
                <div className="mt-1">
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    defaultValue={role === "SUPPLIER" ? "Surat, Gujarat" : ""}
                    placeholder="e.g. Surat, Gujarat"
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-semibold text-slate-700">
                  Full Office/Factory Address *
                </label>
                <div className="mt-1">
                  <textarea
                    id="address"
                    name="address"
                    required
                    rows={2}
                    placeholder="Enter complete mailing/billing address"
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {role === "SUPPLIER" && (
                <>
                  <div className="sm:col-span-2">
                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2 mt-4">
                      Surat Supplier Verification Credentials
                    </h3>
                  </div>

                  <div>
                    <label htmlFor="supplierType" className="block text-sm font-semibold text-slate-700">
                      Supplier Type *
                    </label>
                    <div className="mt-1">
                      <select
                        id="supplierType"
                        name="supplierType"
                        required
                        className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="MANUFACTURER">Manufacturer</option>
                        <option value="TRADER">Trader</option>
                        <option value="WHOLESALER">Wholesaler</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="gstin" className="block text-sm font-semibold text-slate-700">
                      GSTIN (Optional)
                    </label>
                    <div className="mt-1">
                      <input
                        id="gstin"
                        name="gstin"
                        type="text"
                        placeholder="24AAAAA0000A1Z5"
                        className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pan" className="block text-sm font-semibold text-slate-700">
                      PAN/Business Registration No (Optional)
                    </label>
                    <div className="mt-1">
                      <input
                        id="pan"
                        name="pan"
                        type="text"
                        placeholder="ABCDE1234F"
                        className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
                      Company Profile & Fabric Specialization *
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        required
                        rows={3}
                        placeholder="Explain what fabrics you produce or trade, and your manufacturing capacity (e.g. weave capacity, printing facilities)."
                        className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full justify-center rounded-md border border-transparent bg-slate-900 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {isPending ? "Registering..." : `Register as ${role === "SUPPLIER" ? "Supplier" : "Buyer"}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
