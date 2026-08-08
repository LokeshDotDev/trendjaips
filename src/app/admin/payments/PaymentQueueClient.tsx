"use client";

import React, { useState, useTransition } from "react";
import { verifyPaymentAction, rejectPaymentAction } from "../actions";
import { Eye, ExternalLink } from "lucide-react";

interface QueueItem {
  id: string;
  type: "SAMPLE" | "BULK";
  buyer: string;
  fabricName: string;
  amount: number;
  utr: string;
  screenshotUrl: string | null;
  submittedAt: Date;
}

export default function PaymentQueueClient({ initialQueue }: { initialQueue: QueueItem[] }) {
  const [queue, setQueue] = useState(initialQueue);
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  const handleAction = async (type: "SAMPLE" | "BULK", id: string, action: "VERIFY" | "REJECT") => {
    const note = notes[id] || "";
    if (action === "REJECT" && !note.trim()) {
      alert("Please provide a note/reason for rejecting this payment.");
      return;
    }

    if (!confirm(`Are you sure you want to ${action === "VERIFY" ? "verify" : "reject"} this payment?`)) {
      return;
    }

    startTransition(async () => {
      let result;
      if (action === "VERIFY") {
        result = await verifyPaymentAction(type, id, note);
      } else {
        result = await rejectPaymentAction(type, id, note);
      }

      if (result?.error) {
        alert(result.error);
      } else {
        alert(`Payment successfully ${action === "VERIFY" ? "verified" : "rejected"}.`);
        setQueue(queue.filter((item) => item.id !== id));
      }
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
          <tr>
            <th className="px-6 py-4">Order Details</th>
            <th className="px-6 py-4">Buyer</th>
            <th className="px-6 py-4 text-right">Expected Amount</th>
            <th className="px-6 py-4">UTR Reference</th>
            <th className="px-6 py-4 text-center">Receipt Screenshot</th>
            <th className="px-6 py-4">Verification Audit Note</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
          {queue.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/50">
              <td className="px-6 py-4">
                <span className="block font-bold text-slate-900">{item.id}</span>
                <span className="block text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest">{item.type} ORDER</span>
                <span className="block text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.fabricName}</span>
              </td>
              <td className="px-6 py-4">
                <span>{item.buyer}</span>
              </td>
              <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                <span>₹{item.amount.toLocaleString()}</span>
              </td>
              <td className="px-6 py-4">
                <code className="bg-slate-50 border border-slate-100 rounded px-2 py-1 text-slate-900 font-mono text-[11px]">
                  {item.utr}
                </code>
              </td>
              <td className="px-6 py-4 text-center">
                {item.screenshotUrl ? (
                  <a
                    href={item.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 bg-blue-50 px-2.5 py-1.5 rounded"
                  >
                    <Eye className="h-3.5 w-3.5" /> View <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-slate-400">No Image</span>
                )}
              </td>
              <td className="px-6 py-4">
                <input
                  type="text"
                  placeholder="e.g. Cleared in bank"
                  value={notes[item.id] || ""}
                  onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:border-slate-400 focus:outline-none"
                />
              </td>
              <td className="px-6 py-4 text-right space-y-1 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => handleAction(item.type, item.id, "VERIFY")}
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded disabled:opacity-50 text-[11px] uppercase tracking-wider"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleAction(item.type, item.id, "REJECT")}
                  disabled={isPending}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold px-3 py-2 rounded disabled:opacity-50 text-[11px] uppercase tracking-wider"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
