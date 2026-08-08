import React from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import BulkPaymentFormClient from "./BulkPaymentFormClient";

interface BulkPaymentPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function BulkPaymentPage({ searchParams }: BulkPaymentPageProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "BUYER" || !currentUser.buyerProfile) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const orderId = params.orderId;

  if (!orderId) {
    notFound();
  }

  // Load bulk order
  const order = await db.bulkOrder.findUnique({
    where: { id: orderId },
  });

  if (!order || order.buyerId !== currentUser.buyerProfile.id) {
    notFound();
  }

  // Load global manual payment details
  const settings = await db.systemSettings.findUnique({
    where: { id: "global" },
  });

  if (!settings) {
    notFound();
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full font-sans">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
          Submit Bulk Contract Payment
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-semibold">
          Order Reference: <strong className="text-slate-800">{orderId}</strong>
        </p>
      </div>

      <BulkPaymentFormClient order={order} settings={settings} />
    </div>
  );
}
