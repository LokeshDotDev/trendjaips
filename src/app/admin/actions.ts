"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function verifyPaymentAction(
  orderType: "SAMPLE" | "BULK",
  orderId: string,
  note?: string
) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return { error: "Unauthorized. Admin role required." };
  }

  try {
    if (orderType === "SAMPLE") {
      const order = await db.sampleOrder.findUnique({
        where: { id: orderId },
        include: { buyer: true },
      });

      if (!order) return { error: "Sample order not found." };

      await db.$transaction([
        db.sampleOrder.update({
          where: { id: orderId },
          data: {
            paymentStatus: "VERIFIED",
            status: "CONFIRMED",
            paymentVerifiedAt: new Date(),
            paymentVerifiedBy: admin.id,
            paymentAuditNote: note || "Verified manually by Admin.",
          },
        }),
        // Audit log
        db.auditLog.create({
          data: {
            actorId: admin.id,
            action: "PAYMENT_VERIFIED",
            entityType: "SampleOrder",
            entityId: orderId,
            oldState: "PAYMENT_VERIFICATION",
            newState: "CONFIRMED",
            metadata: {
              expectedAmount: order.totalPrice,
              submittedUtr: order.utr,
              note: note || "",
            },
          },
        }),
        // Notification
        db.notification.create({
          data: {
            userId: order.buyer.userId,
            text: `Your payment for Sample Order ${orderId} has been verified. The supplier is preparing shipment.`,
            type: "PAYMENT_VERIFIED",
            link: "/buyer/samples",
          },
        }),
        // Notification to Supplier
        db.notification.create({
          data: {
            userId: (await db.supplierProfile.findUnique({ where: { id: order.supplierId } }))?.userId || "",
            text: `Payment verified for Sample Order ${orderId}. Please package and prepare shipment.`,
            type: "SAMPLE_ORDER_VERIFIED",
            link: "/supplier/samples",
          },
        }),
      ]);
    } else {
      const order = await db.bulkOrder.findUnique({
        where: { id: orderId },
        include: { buyer: true },
      });

      if (!order) return { error: "Bulk order not found." };

      await db.$transaction([
        db.bulkOrder.update({
          where: { id: orderId },
          data: {
            paymentStatus: "VERIFIED",
            status: "PAID",
            paymentVerifiedAt: new Date(),
            paymentVerifiedBy: admin.id,
            paymentAuditNote: note || "Verified manually by Admin.",
          },
        }),
        // Audit log
        db.auditLog.create({
          data: {
            actorId: admin.id,
            action: "PAYMENT_VERIFIED",
            entityType: "BulkOrder",
            entityId: orderId,
            oldState: "PAYMENT_VERIFICATION",
            newState: "PAID",
            metadata: {
              expectedAmount: order.total,
              submittedUtr: order.utr,
              note: note || "",
            },
          },
        }),
        // Notification
        db.notification.create({
          data: {
            userId: order.buyer.userId,
            text: `Your payment for Bulk Order ${orderId} has been verified. The supplier has been notified to start production.`,
            type: "PAYMENT_VERIFIED",
            link: "/buyer/orders",
          },
        }),
        // Notification to Supplier
        db.notification.create({
          data: {
            userId: (await db.supplierProfile.findUnique({ where: { id: order.supplierId } }))?.userId || "",
            text: `Payment verified for Bulk Order ${orderId}. Please begin manufacturing processing.`,
            type: "BULK_ORDER_PAID",
            link: "/supplier/orders",
          },
        }),
      ]);
    }

    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return { error: "Failed to verify payment." };
  }
}

export async function rejectPaymentAction(
  orderType: "SAMPLE" | "BULK",
  orderId: string,
  note?: string
) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return { error: "Unauthorized. Admin role required." };
  }

  try {
    if (orderType === "SAMPLE") {
      const order = await db.sampleOrder.findUnique({
        where: { id: orderId },
        include: { buyer: true },
      });

      if (!order) return { error: "Sample order not found." };

      await db.$transaction([
        db.sampleOrder.update({
          where: { id: orderId },
          data: {
            paymentStatus: "REJECTED",
            status: "PAYMENT_PENDING",
            paymentAuditNote: note || "Rejected manually by Admin.",
          },
        }),
        // Audit
        db.auditLog.create({
          data: {
            actorId: admin.id,
            action: "PAYMENT_REJECTED",
            entityType: "SampleOrder",
            entityId: orderId,
            oldState: "PAYMENT_VERIFICATION",
            newState: "PAYMENT_PENDING",
            metadata: { submittedUtr: order.utr, note: note || "" },
          },
        }),
        // Notify
        db.notification.create({
          data: {
            userId: order.buyer.userId,
            text: `Your payment proof for Sample Order ${orderId} was rejected. Note: ${note || "Incorrect transfer details."}`,
            type: "PAYMENT_REJECTED",
            link: `/checkout/sample/payment?orderId=${orderId}`,
          },
        }),
      ]);
    } else {
      const order = await db.bulkOrder.findUnique({
        where: { id: orderId },
        include: { buyer: true },
      });

      if (!order) return { error: "Bulk order not found." };

      await db.$transaction([
        db.bulkOrder.update({
          where: { id: orderId },
          data: {
            paymentStatus: "REJECTED",
            status: "AWAITING_PAYMENT",
            paymentAuditNote: note || "Rejected manually by Admin.",
          },
        }),
        // Audit
        db.auditLog.create({
          data: {
            actorId: admin.id,
            action: "PAYMENT_REJECTED",
            entityType: "BulkOrder",
            entityId: orderId,
            oldState: "PAYMENT_VERIFICATION",
            newState: "AWAITING_PAYMENT",
            metadata: { submittedUtr: order.utr, note: note || "" },
          },
        }),
        // Notify
        db.notification.create({
          data: {
            userId: order.buyer.userId,
            text: `Your payment proof for Bulk Order ${orderId} was rejected. Note: ${note || "Incorrect transfer details."}`,
            type: "PAYMENT_REJECTED",
            link: `/buyer/orders`, // Let them upload again
          },
        }),
      ]);
    }

    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error: any) {
    console.error("Reject payment error:", error);
    return { error: "Failed to reject payment." };
  }
}

export async function approveSupplierAction(supplierId: string) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return { error: "Unauthorized." };
  }

  try {
    const supplier = await db.supplierProfile.findUnique({
      where: { id: supplierId },
      include: { user: true },
    });

    if (!supplier) return { error: "Supplier not found." };

    await db.$transaction([
      db.supplierProfile.update({
        where: { id: supplierId },
        data: { status: "VERIFIED" },
      }),
      db.auditLog.create({
        data: {
          actorId: admin.id,
          action: "SUPPLIER_APPROVED",
          entityType: "SupplierProfile",
          entityId: supplierId,
          oldState: "PENDING",
          newState: "VERIFIED",
        },
      }),
      db.notification.create({
        data: {
          userId: supplier.userId,
          text: "Congratulations! Your Surat supplier profile has been verified. You can now publish fabrics.",
          type: "SUPPLIER_APPROVED",
          link: "/supplier/fabrics/new",
        },
      }),
    ]);

    revalidatePath("/admin/suppliers");
    return { success: true };
  } catch (error) {
    return { error: "Failed to approve supplier." };
  }
}

export async function approveFabricAction(fabricId: string) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return { error: "Unauthorized." };
  }

  try {
    const fabric = await db.fabric.findUnique({
      where: { id: fabricId },
      include: { supplier: true },
    });

    if (!fabric) return { error: "Fabric listing not found." };

    await db.$transaction([
      db.fabric.update({
        where: { id: fabricId },
        data: { status: "PUBLISHED" },
      }),
      db.auditLog.create({
        data: {
          actorId: admin.id,
          action: "FABRIC_APPROVED",
          entityType: "Fabric",
          entityId: fabricId,
          oldState: "PENDING_APPROVAL",
          newState: "PUBLISHED",
        },
      }),
      db.notification.create({
        data: {
          userId: fabric.supplier.userId,
          text: `Your fabric listing ${fabric.name} (${fabric.fabricId}) has been approved and is now live.`,
          type: "FABRIC_APPROVED",
          link: `/fabrics/${fabric.slug}`,
        },
      }),
    ]);

    revalidatePath("/admin/fabrics");
    return { success: true };
  } catch (error) {
    return { error: "Failed to approve fabric." };
  }
}

export async function resolveDisputeAction(
  disputeId: string,
  resolution: "RESOLVED_BUYER" | "RESOLVED_SUPPLIER",
  adminNotes?: string
) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return { error: "Unauthorized." };
  }

  try {
    const dispute = await db.dispute.findUnique({
      where: { id: disputeId },
      include: { order: { include: { buyer: true, supplier: true } } },
    });

    if (!dispute) return { error: "Dispute not found." };

    const order = dispute.order;
    const finalOrderStatus = resolution === "RESOLVED_BUYER" ? "REFUND_PENDING" : "COMPLETED";

    await db.$transaction([
      // 1. Resolve dispute record
      db.dispute.update({
        where: { id: disputeId },
        data: {
          status: resolution === "RESOLVED_BUYER" ? "RESOLVED_BUYER" : "RESOLVED_SUPPLIER",
          adminNotes: adminNotes || `Resolved in favor of ${resolution.split("_")[1]}.`,
        },
      }),
      // 2. Resolve order status
      db.bulkOrder.update({
        where: { id: order.id },
        data: { status: finalOrderStatus },
      }),
      // 3. Audit
      db.auditLog.create({
        data: {
          actorId: admin.id,
          action: "DISPUTE_RESOLVED",
          entityType: "Dispute",
          entityId: disputeId,
          oldState: "OPEN",
          newState: resolution,
          metadata: { orderId: order.id, finalOrderStatus },
        },
      }),
      // 4. Notify buyer
      db.notification.create({
        data: {
          userId: order.buyer.userId,
          text: `Dispute on Bulk Order ${order.id} was resolved by Admin in favor of ${resolution.split("_")[1]}. Order status is now ${finalOrderStatus.replace(/_/g, " ")}.`,
          type: "DISPUTE_RESOLVED",
          link: "/buyer/orders",
        },
      }),
      // 5. Notify supplier
      db.notification.create({
        data: {
          userId: order.supplier.userId,
          text: `Dispute on Bulk Order ${order.id} was resolved by Admin in favor of ${resolution.split("_")[1]}. Order status is now ${finalOrderStatus.replace(/_/g, " ")}.`,
          type: "DISPUTE_RESOLVED",
          link: "/supplier/orders",
        },
      }),
    ]);

    revalidatePath("/admin/disputes");
    return { success: true };
  } catch (error) {
    console.error("Resolve dispute error:", error);
    return { error: "Failed to resolve dispute." };
  }
}
