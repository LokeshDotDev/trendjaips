import React from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import NegotiationRoomClient from "./NegotiationRoomClient";

interface NegotiationPageProps {
  params: Promise<{ id: string }>;
}

export default async function NegotiationPage({ params }: NegotiationPageProps) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/auth/login");
  }

  // Fetch negotiation thread
  const negotiation = await db.negotiation.findUnique({
    where: { id },
    include: {
      rfq: {
        include: {
          fabric: {
            include: { supplier: true },
          },
          buyer: true,
        },
      },
      messages: { orderBy: { createdAt: "asc" } },
      offers: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!negotiation) {
    notFound();
  }

  // Authorize user
  const isBuyer = currentUser.role === "BUYER" && negotiation.buyerId === currentUser.buyerProfile?.id;
  const isSupplier = currentUser.role === "SUPPLIER" && negotiation.supplierId === currentUser.supplierProfile?.id;

  if (!isBuyer && !isSupplier) {
    notFound(); // Not authorized
  }

  // Check if buyer has previously received a sample of this fabric (to show to supplier/buyer)
  const pastSample = await db.sampleOrder.findFirst({
    where: {
      buyerId: negotiation.buyerId,
      fabricId: negotiation.rfq.fabricId,
      status: { in: ["DELIVERED", "COMPLETED"] },
    },
  });
  const previouslySampled = !!pastSample;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-screen flex flex-col font-sans">
      <NegotiationRoomClient
        negotiation={negotiation}
        currentUser={currentUser}
        isBuyer={isBuyer}
        isSupplier={isSupplier}
        previouslySampled={previouslySampled}
      />
    </div>
  );
}
