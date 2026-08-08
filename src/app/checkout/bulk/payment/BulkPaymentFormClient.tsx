"use client";

import React, { useActionState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { submitBulkPaymentAction } from "../../bulk-actions";
import { QrCode, Copy, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

interface BulkPaymentFormClientProps {
  order: {
    id: string;
    total: any;
    quantity: number;
    unit: string;
  };
  settings: {
    upiId: string;
    upiQrUrl: string | null;
    bankInstructions: string;
  };
}

export default function BulkPaymentFormClient({ order, settings }: BulkPaymentFormClientProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(submitBulkPaymentAction, null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("UPI ID copied to clipboard!");
  };

  if (state?.success) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm text-center space-y-6 font-sans">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Payment Verification Pending</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your bulk payment receipt and transaction UTR have been uploaded. Admins will verify clear credit before releasing the order to supplier loom production.
          </p>
        </div>
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={() => router.push("/buyer/orders")}
            className="w-full justify-center rounded-md bg-slate-900 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            Go to My Bulk Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6 font-sans">
      {/* Expected Amount Highlight */}
      <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 text-center">
        <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">
          Exact Bulk Amount to Transfer
        </span>
        <span className="text-3xl font-black text-slate-950">
          ₹{parseFloat(order.total.toString()).toLocaleString()}
        </span>
        <span className="block text-xs text-slate-500 font-medium mt-1">
          Contract total for {order.quantity.toLocaleString()} {order.unit}s
        </span>
      </div>

      {/* Transfer Instructions */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          1. Wire Funds / Transfer
        </h3>

        {/* UPI Instruction */}
        <div className="border border-slate-200 rounded-lg p-4 space-y-4">
          <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <QrCode className="h-4 w-4 text-blue-600" /> Pay using UPI
          </span>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center py-2 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
            {settings.upiQrUrl && (
              <img
                src={settings.upiQrUrl}
                alt="UPI QR Code"
                className="h-32 w-32 object-contain border border-slate-100 rounded bg-white"
              />
            )}
            <div className="text-center sm:text-left space-y-2">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">UPI ID</span>
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded shadow-sm">
                <code className="text-sm font-bold text-slate-900">{settings.upiId}</code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settings.upiId)}
                  className="text-slate-400 hover:text-blue-600 focus:outline-none"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bank transfer instruction details */}
        <div className="border border-slate-200 rounded-lg p-4 space-y-2">
          <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Bank Transfer Details (IMPS / NEFT / RTGS)
          </span>
          <pre className="text-xs text-slate-600 bg-slate-50 p-3 rounded leading-relaxed font-mono whitespace-pre-wrap">
            {settings.bankInstructions}
          </pre>
        </div>
      </div>

      {/* Form Proof upload */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(() => {
            formAction(formData);
          });
        }}
        className="space-y-6 pt-4 border-t border-slate-100"
      >
        <input type="hidden" name="orderId" value={order.id} />

        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          2. Submit Bank Reference (UTR)
        </h3>

        {state?.error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        <div>
          <label htmlFor="utr" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            UTR / IMPS Transaction Ref *
          </label>
          <input
            id="utr"
            name="utr"
            type="text"
            required
            placeholder="e.g. UTR88390..."
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-[10px] text-slate-400">
            For IMPS/NEFT transfers, enter the unique transaction reference from your bank statement.
          </p>
        </div>

        <div>
          <label htmlFor="screenshot" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Transfer Receipt Screenshot *
          </label>
          <input
            id="screenshot"
            name="screenshot"
            type="file"
            accept="image/*"
            required
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
          />
          <p className="mt-1 text-[10px] text-slate-400">
            Accepts PNG, JPG, JPEG. Max file size: 5MB.
          </p>
        </div>

        {/* Warning Note */}
        <div className="rounded-md bg-blue-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <h4 className="font-bold">Payment Verification Confirmation</h4>
            <p className="mt-0.5 leading-relaxed">
              Our administration will manually verify credit arrival before releasing orders. Sourcing terms are frozen under contract total.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full justify-center rounded-md border border-transparent bg-slate-900 py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
        >
          {isPending ? "Submitting Payment Details..." : "Upload Payment Receipt"}
        </button>
      </form>
    </div>
  );
}
