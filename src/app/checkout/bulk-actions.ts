"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function generateBulkOrderId() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `B-${rand}`;
}

function generateDisputeId() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `DISP-${rand}`;
}

export async function createBulkOrderAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "BUYER" || !currentUser.buyerProfile) {
    return { error: "Unauthorized. Buyer account required." };
  }

  const offerId = formData.get("offerId") as string;
  const addressName = formData.get("addressName") as string;
  const addressLine1 = formData.get("addressLine1") as string;
  const addressLine2 = formData.get("addressLine2") as string;
  const addressCity = formData.get("addressCity") as string;
  const addressState = formData.get("addressState") as string;
  const addressZip = formData.get("addressZip") as string;
  const addressPhone = formData.get("addressPhone") as string;

  if (!offerId || !addressName || !addressLine1 || !addressCity || !addressState || !addressZip || !addressPhone) {
    return { error: "Please fill in all required shipping details." };
  }

  let orderId = "";

  try {
    // Retrieve offer terms
    const offer = await db.offer.findUnique({
      where: { id: offerId, status: "ACCEPTED" },
      include: { negotiation: { include: { rfq: { include: { fabric: { include: { supplier: true } } } } } } },
    });

    if (!offer) {
      return { error: "Accepted offer not found or invalid." };
    }

    const rfq = offer.negotiation.rfq;
    const fabric = rfq.fabric;

    // Check if bulk order already created for this offer
    const existingOrder = await db.bulkOrder.findFirst({
      where: { offerId: offer.id },
    });
    if (existingOrder) {
      return { error: "A bulk order has already been created for this negotiation." };
    }

    orderId = generateBulkOrderId();

    // 2% default platform commission
    const commissionRate = 0.02;
    const commissionAmount = offer.subtotal.toNumber() * commissionRate;

    await db.$transaction(async (tx) => {
      // 1. Create Bulk Order (snapshotting commercial terms)
      await tx.bulkOrder.create({
        data: {
          id: orderId,
          buyerId: currentUser.buyerProfile!.id,
          supplierId: fabric.supplierId,
          fabricId: fabric.id,
          fabricNameSnapshot: fabric.name,
          fabricIdSnapshot: fabric.fabricId,
          fabricDescSnapshot: fabric.description,
          quantity: offer.quantity,
          unit: rfq.unit,
          pricePerUnit: offer.pricePerMetre,
          subtotal: offer.subtotal,
          shipping: offer.shippingCharge,
          total: offer.total,
          productionTime: offer.productionDays,
          offerId: offer.id,
          rfqId: rfq.id,
          status: "AWAITING_PAYMENT",
          shippingAddressName: addressName,
          shippingAddressLine1: addressLine1,
          shippingAddressLine2: addressLine2 || null,
          shippingAddressCity: addressCity,
          shippingAddressState: addressState,
          shippingAddressZip: addressZip,
          shippingAddressPhone: addressPhone,
          commissionRate,
          commissionAmount,
        },
      });

      // 2. Update RFQ status
      await tx.rFQ.update({
        where: { id: rfq.id },
        data: { status: "ORDER_CREATED" },
      });

      // 3. Notify Supplier
      await tx.notification.create({
        data: {
          userId: fabric.supplier.userId,
          text: `Bulk Order ${orderId} created for ${fabric.name}. Awaiting buyer payment confirmation.`,
          type: "BULK_ORDER_CREATED",
          link: `/supplier/orders`,
        },
      });
    });
  } catch (error) {
    console.error("Create bulk order error:", error);
    return { error: "Failed to create bulk order." };
  }

  redirect(`/checkout/bulk/payment?orderId=${orderId}`);
}

export async function submitBulkPaymentAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "BUYER" || !currentUser.buyerProfile) {
    return { error: "Unauthorized." };
  }

  const orderId = formData.get("orderId") as string;
  const utr = formData.get("utr") as string;
  const screenshotFile = formData.get("screenshot") as File;

  if (!orderId || !utr || !screenshotFile || screenshotFile.size === 0) {
    return { error: "Please enter UTR reference and upload the payment receipt screenshot." };
  }

  try {
    const order = await db.bulkOrder.findUnique({
      where: { id: orderId },
    });

    if (!order || order.buyerId !== currentUser.buyerProfile.id) {
      return { error: "Order not found." };
    }

    // Upload receipt screenshot
    const screenshotUrl = await uploadFile(screenshotFile);

    // Update order status
    await db.$transaction([
      db.bulkOrder.update({
        where: { id: orderId },
        data: {
          utr,
          paymentScreenshotUrl: screenshotUrl,
          status: "PAYMENT_VERIFICATION",
          paymentStatus: "VERIFICATION_PENDING",
        },
      }),
      // Audit
      db.auditLog.create({
        data: {
          actorId: currentUser.id,
          action: "BULK_PAYMENT_SUBMITTED",
          entityType: "BulkOrder",
          entityId: orderId,
          newState: "PAYMENT_VERIFICATION",
        },
      }),
    ]);

    // Notify Admins
    const admins = await db.user.findMany({ where: { role: "ADMIN" } });
    for (const ad of admins) {
      await db.notification.create({
        data: {
          userId: ad.id,
          text: `Payment verification request submitted for Bulk Order ${orderId}.`,
          type: "BULK_PAYMENT_VERIFICATION_PENDING",
          link: "/admin/payments",
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Submit bulk payment error:", error);
    return { error: "Failed to submit payment verification." };
  }
}

export async function updateBulkOrderStateAction(
  orderId: string,
  newState: "PROCESSING" | "READY_TO_SHIP" | "SHIPPED" | "DELIVERED",
  courierName?: string,
  trackingId?: string,
  trackingUrl?: string
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPPLIER" && user.role !== "ADMIN")) {
    return { error: "Unauthorized." };
  }

  try {
    const order = await db.bulkOrder.findUnique({
      where: { id: orderId },
      include: { buyer: true },
    });

    if (!order) return { error: "Bulk order not found." };

    if (user.role === "SUPPLIER" && order.supplierId !== user.supplierProfile?.id) {
      return { error: "Unauthorized order mismatch." };
    }

    // Rule: Supplier cannot fulfill an unpaid order
    if (order.status === "AWAITING_PAYMENT" || order.status === "PAYMENT_VERIFICATION" || order.status === "QUOTE_ACCEPTED") {
      return { error: "Cannot dispatch bulk order. Payment verification by Admin is required." };
    }

    const data: any = {
      status: newState,
    };

    if (newState === "SHIPPED") {
      if (!courierName || !trackingId) {
        return { error: "Courier name and tracking ID are required to mark as shipped." };
      }
      data.courierName = courierName;
      data.trackingId = trackingId;
      data.trackingUrl = trackingUrl || null;
      data.shippedAt = new Date();
    }

    if (newState === "DELIVERED") {
      data.deliveredAt = new Date();
      // Set 3-day (72-hour) inspection window
      data.inspectionEndsAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    }

    await db.$transaction([
      db.bulkOrder.update({
        where: { id: orderId },
        data,
      }),
      db.auditLog.create({
        data: {
          actorId: user.id,
          action: "BULK_ORDER_STATUS_CHANGED",
          entityType: "BulkOrder",
          entityId: orderId,
          oldState: order.status,
          newState,
        },
      }),
      db.notification.create({
        data: {
          userId: order.buyer.userId,
          text: `Your Bulk Order ${orderId} has been updated to: ${newState.replace(/_/g, " ")}.`,
          type: "BULK_ORDER_STATUS_UPDATE",
          link: "/buyer/orders",
        },
      }),
    ]);

    revalidatePath(`/supplier/orders`);
    revalidatePath(`/buyer/orders`);
    return { success: true };
  } catch (error) {
    console.error("Update bulk state error:", error);
    return { error: "Failed to update bulk order state." };
  }
}

export async function buyerAcceptBulkOrderAction(orderId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "BUYER" || !user.buyerProfile) {
    return { error: "Unauthorized." };
  }

  try {
    const order = await db.bulkOrder.findUnique({
      where: { id: orderId },
    });

    if (!order || order.buyerId !== user.buyerProfile.id) {
      return { error: "Bulk order not found." };
    }

    // Verify it is in inspection period
    if (order.status !== "DELIVERED") {
      return { error: "Only delivered orders under inspection can be accepted." };
    }

    await db.$transaction([
      db.bulkOrder.update({
        where: { id: orderId },
        data: { status: "COMPLETED" },
      }),
      db.auditLog.create({
        data: {
          actorId: user.id,
          action: "BULK_ORDER_COMPLETED",
          entityType: "BulkOrder",
          entityId: orderId,
          oldState: "DELIVERED",
          newState: "COMPLETED",
        },
      }),
      db.notification.create({
        data: {
          userId: (await db.supplierProfile.findUnique({ where: { id: order.supplierId } }))?.userId || "",
          text: `Bulk Order ${orderId} has been accepted by the buyer and is now completed.`,
          type: "BULK_ORDER_COMPLETED",
          link: "/supplier/orders",
        },
      }),
    ]);

    revalidatePath(`/buyer/orders`);
    revalidatePath(`/supplier/orders`);
    return { success: true };
  } catch (error) {
    console.error("Accept bulk order error:", error);
    return { error: "Failed to accept order." };
  }
}

export async function raiseDisputeAction(orderId: string, reason: string, description: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "BUYER" || !user.buyerProfile) {
    return { error: "Unauthorized." };
  }

  if (!reason || !description) {
    return { error: "Dispute reason and description are required." };
  }

  try {
    const order = await db.bulkOrder.findUnique({
      where: { id: orderId },
    });

    if (!order || order.buyerId !== user.buyerProfile.id) {
      return { error: "Bulk order not found." };
    }

    if (order.status !== "DELIVERED") {
      return { error: "Disputes can only be raised for delivered orders during the 72h inspection window." };
    }

    const disputeId = generateDisputeId();

    await db.$transaction([
      // Update order status to DISPUTED (blocks completion)
      db.bulkOrder.update({
        where: { id: orderId },
        data: { status: "DISPUTED" },
      }),
      // Create dispute record
      db.dispute.create({
        data: {
          id: disputeId,
          orderId,
          raisedBy: "BUYER",
          reason,
          description,
          status: "OPEN",
        },
      }),
      db.auditLog.create({
        data: {
          actorId: user.id,
          action: "DISPUTE_RAISED",
          entityType: "BulkOrder",
          entityId: orderId,
          oldState: "DELIVERED",
          newState: "DISPUTED",
        },
      }),
      // Notify Supplier
      db.notification.create({
        data: {
          userId: (await db.supplierProfile.findUnique({ where: { id: order.supplierId } }))?.userId || "",
          text: `A dispute has been raised by the buyer on Bulk Order ${orderId}. Status is locked under review.`,
          type: "DISPUTE_OPENED",
          link: "/supplier/orders",
        },
      }),
      // Notify Admin
      ...((await db.user.findMany({ where: { role: "ADMIN" } })).map((ad) =>
        db.notification.create({
          data: {
            userId: ad.id,
            text: `Dispute ${disputeId} raised on Bulk Order ${orderId} by buyer.`,
            type: "DISPUTE_OPENED",
            link: "/admin/disputes",
          },
        })
      )),
    ]);

    revalidatePath(`/buyer/orders`);
    revalidatePath(`/supplier/orders`);
    return { success: true };
  } catch (error) {
    console.error("Raise dispute error:", error);
    return { error: "Failed to log dispute." };
  }
}
