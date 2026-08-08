"use client";

import React, { useState, useTransition } from "react";
import { approveSupplierAction } from "../actions";
import { MapPin, User, FileText, Check } from "lucide-react";

interface SupplierProfile {
  id: string;
  businessName: string;
  contactName: string;
  businessType: string;
  location: string;
  address: string;
  description: string;
  supplierType: string;
  gstin: string | null;
  pan: string | null;
}

export default function SupplierQueueClient({ initialSuppliers }: { initialSuppliers: SupplierProfile[] }) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    if (!confirm("Are you sure you want to approve this supplier? They will go live instantly.")) {
      return;
    }

    startTransition(async () => {
      const result = await approveSupplierAction(id);
      if (result?.error) {
        alert(result.error);
      } else {
        alert("Supplier profile verified successfully!");
        setSuppliers(suppliers.filter((s) => s.id !== id));
      }
    });
  };

  return (
    <div className="space-y-6">
      {suppliers.map((sup) => (
        <div key={sup.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-start font-sans">
          <div className="md:col-span-3 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-slate-900">{sup.businessName}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 uppercase tracking-widest border border-blue-100">
                  {sup.supplierType}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {sup.location} | {sup.businessType}
              </p>
            </div>

            <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
              <p className="leading-relaxed">
                <strong className="text-slate-900 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Company Bio:</strong>
                {sup.description}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Contact Person</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                    <User className="h-3 w-3 text-slate-400" /> {sup.contactName}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tax Registration</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                    <FileText className="h-3.5 w-3.5 text-slate-400" /> GST: {sup.gstin || "N/A"} | PAN: {sup.pan || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center h-full border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <button
              onClick={() => handleApprove(sup.id)}
              disabled={isPending}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm focus:outline-none"
            >
              <Check className="h-4 w-4" /> Approve Supplier
            </button>
            <span className="block text-[10px] text-slate-400 text-center mt-2 leading-relaxed">
              Verify credentials and location before approving.
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
