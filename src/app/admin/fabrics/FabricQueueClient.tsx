"use client";

import React, { useState, useTransition } from "react";
import { approveFabricAction } from "../actions";
import { Check, User, Scissors, DollarSign } from "lucide-react";

interface Fabric {
  id: string;
  fabricId: string;
  name: string;
  price: any;
  unit: string;
  moq: number;
  gsm: number;
  width: number;
  composition: string;
  supplier: {
    businessName: string;
  };
  category: {
    name: string;
  };
}

export default function FabricQueueClient({ initialFabrics }: { initialFabrics: Fabric[] }) {
  const [fabrics, setFabrics] = useState(initialFabrics);
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    if (!confirm("Are you sure you want to approve this fabric listing? It will go live instantly.")) {
      return;
    }

    startTransition(async () => {
      const result = await approveFabricAction(id);
      if (result?.error) {
        alert(result.error);
      } else {
        alert("Fabric listing approved and is now live!");
        setFabrics(fabrics.filter((f) => f.id !== id));
      }
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-sans">
        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
          <tr>
            <th className="px-6 py-4">Fabric Details</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Supplier / Mill</th>
            <th className="px-6 py-4 text-right">Price per Metre</th>
            <th className="px-6 py-4 text-right">Minimum Order (MOQ)</th>
            <th className="px-6 py-4">Specifications</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
          {fabrics.map((fab) => (
            <tr key={fab.id} className="hover:bg-slate-50/50">
              <td className="px-6 py-4">
                <span className="font-bold text-slate-900 block">{fab.name}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5 uppercase tracking-widest">ID: {fab.fabricId}</span>
              </td>
              <td className="px-6 py-4">
                <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                  {fab.category.name}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3 text-slate-400" /> {fab.supplier.businessName}
                </span>
              </td>
              <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                <span>₹{parseFloat(fab.price.toString()).toFixed(2)} / {fab.unit}</span>
              </td>
              <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                <span>{fab.moq.toLocaleString()} m</span>
              </td>
              <td className="px-6 py-4 text-slate-500 space-y-0.5 text-[10px]">
                <span className="block">GSM: {fab.gsm}</span>
                <span className="block">Width: {fab.width} inches</span>
                <span className="block truncate max-w-[150px]">Composition: {fab.composition}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => handleApprove(fab.id)}
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded disabled:opacity-50 text-[11px] uppercase tracking-wider inline-flex items-center gap-1 shadow-sm"
                >
                  <Check className="h-3.5 w-3.5" /> Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
