import React from "react";
import { db } from "@/lib/db";
import { CreditCard, ShieldCheck, AlertCircle, ExternalLink } from "lucide-react";
import PaymentQueueClient from "./PaymentQueueClient";

export default async function AdminPaymentsPage() {
  // Fetch pending sample payments
  const samplePayments = await db.sampleOrder.findMany({
    where: { status: "PAYMENT_VERIFICATION" },
    include: {
      buyer: true,
      fabric: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  // Fetch pending bulk payments
  const bulkPayments = await db.bulkOrder.findMany({
    where: { status: "PAYMENT_VERIFICATION" },
    include: {
      buyer: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  // Combine into a single unified queue
  const queue = [
    ...samplePayments.map((p) => ({
      id: p.id,
      type: "SAMPLE" as const,
      buyer: p.buyer.businessName,
      fabricName: p.fabric.name,
      amount: p.totalPrice.toNumber(),
      utr: p.utr || "N/A",
      screenshotUrl: p.paymentScreenshotUrl,
      submittedAt: p.updatedAt,
    })),
    ...bulkPayments.map((p) => ({
      id: p.id,
      type: "BULK" as const,
      buyer: p.buyer.businessName,
      fabricName: p.fabricNameSnapshot,
      amount: p.total.toNumber(),
      utr: p.utr || "N/A",
      screenshotUrl: p.paymentScreenshotUrl,
      submittedAt: p.updatedAt,
    })),
  ].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-blue-600" /> Manual Payment Verification
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Verify bank credit before authorizing suppliers to fulfill. Match UTR records with bank statements.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md flex gap-3 text-xs leading-relaxed max-w-2xl">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
        <div>
          <h4 className="font-bold">Security Notice for Administrators</h4>
          <p className="mt-0.5">
            Never approve a transaction based on screenshot visual contents alone. Always cross-check the submitted <strong>UTR reference number</strong> in your company bank account ledger to verify clear funds.
          </p>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 space-y-2">
          <ShieldCheck className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Queue is Clear</h3>
          <p className="text-xs">No pending manual payment verification requests found.</p>
        </div>
      ) : (
        <PaymentQueueClient initialQueue={queue} />
      )}
    </div>
  );
}
