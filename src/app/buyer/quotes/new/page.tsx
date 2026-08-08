import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import NewRfqFormClient from "./NewRfqFormClient";

interface NewRfqPageProps {
  searchParams: Promise<{ fabricId?: string }>;
}

export default async function NewRfqPage({ searchParams }: NewRfqPageProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "BUYER" || !currentUser.buyerProfile) {
    redirect("/auth/login?callbackUrl=/buyer/quotes/new");
  }

  const params = await searchParams;
  const fabricId = params.fabricId;

  if (!fabricId) {
    notFound();
  }

  const fabric = await db.fabric.findUnique({
    where: { id: fabricId, status: "PUBLISHED" },
    include: {
      supplier: true,
      sampleOptions: true,
    },
  });

  if (!fabric) {
    notFound();
  }

  // Check if buyer previously received a sample of this fabric
  const pastSample = await db.sampleOrder.findFirst({
    where: {
      buyerId: currentUser.buyerProfile.id,
      fabricId: fabric.id,
      status: { in: ["DELIVERED", "COMPLETED"] },
    },
  });

  const previouslySampled = !!pastSample;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans">
      <div className="border-b border-slate-200 pb-5 mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Request Bulk Quote
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Submit commercial requirements to initiate private pricing negotiations.
        </p>
      </div>

      <NewRfqFormClient fabric={fabric} previouslySampled={previouslySampled} />
    </div>
  );
}
