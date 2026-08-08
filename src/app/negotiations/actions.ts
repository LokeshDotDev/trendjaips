"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function generateRfqId() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `RFQ-${rand}`;
}

function generateOfferId() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `OFFER-${rand}`;
}

export async function createRfqAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "BUYER" || !currentUser.buyerProfile) {
    return { error: "Unauthorized. Please log in as a buyer." };
  }

  const fabricId = formData.get("fabricId") as string;
  const quantityInput = formData.get("quantity") as string;
  const unit = formData.get("unit") as string || "metre";
  const color = formData.get("color") as string;
  const requiredDeliveryDateInput = formData.get("requiredDeliveryDate") as string;
  const deliveryLocation = formData.get("deliveryLocation") as string;
  const targetPriceInput = formData.get("targetPrice") as string;
  const requirements = formData.get("requirements") as string;

  if (!fabricId || !quantityInput || !color || !requiredDeliveryDateInput || !deliveryLocation || !targetPriceInput) {
    return { error: "Please fill in all required RFQ details." };
  }

  const quantity = parseInt(quantityInput);
  const targetPrice = parseFloat(targetPriceInput);
  const requiredDeliveryDate = new Date(requiredDeliveryDateInput);

  if (isNaN(quantity) || isNaN(targetPrice) || isNaN(requiredDeliveryDate.getTime())) {
    return { error: "Please enter valid quantity, target price, and delivery date." };
  }

  let negotiationId = "";

  try {
    const fabric = await db.fabric.findUnique({
      where: { id: fabricId, status: "PUBLISHED" },
      include: { supplier: true },
    });

    if (!fabric) {
      return { error: "Fabric not found or unavailable." };
    }

    const rfqId = generateRfqId();

    // Create RFQ, Negotiation and send notification in a transaction
    const negotiation = await db.$transaction(async (tx) => {
      const newRfq = await tx.rFQ.create({
        data: {
          id: rfqId,
          buyerId: currentUser.buyerProfile!.id,
          supplierId: fabric.supplierId,
          fabricId: fabric.id,
          quantity,
          unit,
          color,
          requiredDeliveryDate,
          deliveryLocation,
          targetPrice,
          requirements,
          status: "REQUESTED",
        },
      });

      const newNeg = await tx.negotiation.create({
        data: {
          rfqId: newRfq.id,
          buyerId: currentUser.buyerProfile!.id,
          supplierId: fabric.supplierId,
        },
      });

      // Notify Supplier
      await tx.notification.create({
        data: {
          userId: fabric.supplier.userId,
          text: `New Bulk RFQ ${rfqId} received from ${currentUser.buyerProfile!.businessName} for ${fabric.name}.`,
          type: "RFQ_RECEIVED",
          link: `/supplier/quotes`,
        },
      });

      return newNeg;
    });

    negotiationId = negotiation.id;
  } catch (error) {
    console.error("Create RFQ error:", error);
    return { error: "Failed to create RFQ request." };
  }

  redirect(`/negotiations/${negotiationId}`);
}

export async function sendNegotiationMessageAction(negotiationId: string, text: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized." };

  if (!text || !text.trim()) return { error: "Message cannot be empty." };

  try {
    const neg = await db.negotiation.findUnique({
      where: { id: negotiationId },
      include: { rfq: { include: { fabric: true } } },
    });

    if (!neg) return { error: "Negotiation not found." };

    // Authority check
    if (user.role === "BUYER" && neg.buyerId !== user.buyerProfile?.id) {
      return { error: "Unauthorized thread." };
    }
    if (user.role === "SUPPLIER" && neg.supplierId !== user.supplierProfile?.id) {
      return { error: "Unauthorized thread." };
    }

    const msg = await db.message.create({
      data: {
        negotiationId,
        senderRole: user.role,
        text: text.trim(),
      },
    });

    // Notify other user
    const recipientUserId = user.role === "BUYER" 
      ? (await db.supplierProfile.findUnique({ where: { id: neg.supplierId } }))?.userId 
      : (await db.buyerProfile.findUnique({ where: { id: neg.buyerId } }))?.userId;

    if (recipientUserId) {
      await db.notification.create({
        data: {
          userId: recipientUserId,
          text: `New negotiation message regarding RFQ ${neg.rfqId}.`,
          type: "NEW_MESSAGE",
          link: `/negotiations/${negotiationId}`,
        },
      });
    }

    revalidatePath(`/negotiations/${negotiationId}`);
    return { success: true, message: msg };
  } catch (error) {
    console.error("Send message error:", error);
    return { error: "Failed to send message." };
  }
}

export async function createStructuredOfferAction(
  negotiationId: string,
  pricePerMetre: number,
  quantity: number,
  shippingCharge: number,
  productionDays: number,
  notes?: string
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPPLIER" && user.role !== "BUYER")) {
    return { error: "Unauthorized." };
  }

  if (isNaN(pricePerMetre) || isNaN(quantity) || isNaN(shippingCharge) || isNaN(productionDays)) {
    return { error: "Invalid specifications." };
  }

  try {
    const neg = await db.negotiation.findUnique({
      where: { id: negotiationId },
      include: { rfq: true },
    });

    if (!neg) return { error: "Negotiation room not found." };

    if (user.role === "BUYER" && neg.buyerId !== user.buyerProfile?.id) {
      return { error: "Unauthorized." };
    }
    if (user.role === "SUPPLIER" && neg.supplierId !== user.supplierProfile?.id) {
      return { error: "Unauthorized." };
    }

    // Freeze validation: check if RFQ is already accepted/complete
    if (neg.rfq.status === "ACCEPTED" || neg.rfq.status === "ORDER_CREATED") {
      return { error: "RFQ has already been accepted or converted into order." };
    }

    const subtotal = pricePerMetre * quantity;
    const total = subtotal + shippingCharge;
    const offerId = generateOfferId();

    // Validity: 3 days from now
    const offerValidity = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const offer = await db.offer.create({
      data: {
        id: offerId,
        rfqId: neg.rfqId,
        negotiationId,
        createdBy: user.role,
        pricePerMetre,
        quantity,
        subtotal,
        shippingCharge,
        total,
        productionDays,
        offerValidity,
        notes,
        status: "ACTIVE",
      },
    });

    // Notify other user
    const recipientUserId = user.role === "BUYER" 
      ? (await db.supplierProfile.findUnique({ where: { id: neg.supplierId } }))?.userId 
      : (await db.buyerProfile.findUnique({ where: { id: neg.buyerId } }))?.userId;

    if (recipientUserId) {
      await db.notification.create({
        data: {
          userId: recipientUserId,
          text: `New structured commercial offer received (Total: ₹${total.toLocaleString()}).`,
          type: "OFFER_RECEIVED",
          link: `/negotiations/${negotiationId}`,
        },
      });
    }

    revalidatePath(`/negotiations/${negotiationId}`);
    return { success: true, offer };
  } catch (error) {
    console.error("Create offer error:", error);
    return { error: "Failed to submit offer." };
  }
}

export async function acceptOfferAction(offerId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized." };

  try {
    // 1. Transaction to prevent double-acceptance race conditions
    const result = await db.$transaction(async (tx) => {
      const offer = await tx.offer.findUnique({
        where: { id: offerId },
        include: { negotiation: { include: { rfq: true } } },
      });

      if (!offer) {
        throw new Error("Offer not found.");
      }

      if (offer.status !== "ACTIVE") {
        throw new Error("Only active offers can be accepted.");
      }

      const rfq = offer.negotiation.rfq;
      if (rfq.status === "ACCEPTED" || rfq.status === "ORDER_CREATED") {
        throw new Error("RFQ has already been accepted or ordered.");
      }

      // Check authorization: only the OTHER party can accept (e.g. if offer created by supplier, buyer must accept)
      if (offer.createdBy === "SUPPLIER" && user.role !== "BUYER") {
        throw new Error("Only the buyer can accept supplier offers.");
      }
      if (offer.createdBy === "BUYER" && user.role !== "SUPPLIER") {
        throw new Error("Only the supplier can accept buyer counteroffers.");
      }

      // 2. Mark this offer ACCEPTED
      const updatedOffer = await tx.offer.update({
        where: { id: offerId },
        data: { status: "ACCEPTED" },
      });

      // 3. Counter/Inactivate all other offers in thread
      await tx.offer.updateMany({
        where: {
          negotiationId: offer.negotiationId,
          id: { not: offerId },
          status: "ACTIVE",
        },
        data: { status: "COUNTERED" },
      });

      // 4. Update RFQ status
      await tx.rFQ.update({
        where: { id: offer.rfqId },
        data: { status: "ACCEPTED" },
      });

      // 5. Notify the creator of the offer
      const creatorUserId = offer.createdBy === "SUPPLIER" 
        ? (await tx.supplierProfile.findUnique({ where: { id: offer.negotiation.supplierId } }))?.userId
        : (await tx.buyerProfile.findUnique({ where: { id: offer.negotiation.buyerId } }))?.userId;

      if (creatorUserId) {
        await tx.notification.create({
          data: {
            userId: creatorUserId,
            text: `Commercial terms ACCEPTED for RFQ ${rfq.id}. Ready to generate bulk order.`,
            type: "OFFER_ACCEPTED",
            link: `/negotiations/${offer.negotiationId}`,
          },
        });
      }

      return updatedOffer;
    });

    revalidatePath(`/negotiations/${result.negotiationId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Accept offer error:", error.message);
    return { error: error.message || "Failed to accept offer." };
  }
}
