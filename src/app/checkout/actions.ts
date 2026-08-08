"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";
import { redirect } from "next/navigation";

function generateSampleOrderId() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `SO-${rand}`;
}

export async function createSampleOrderAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "BUYER" || !currentUser.buyerProfile) {
    return { error: "Unauthorized. Please log in as a buyer." };
  }

  const fabricId = formData.get("fabricId") as string;
  const sampleOptionId = formData.get("sampleOptionId") as string;
  const quantityInput = formData.get("quantity") as string;
  const quantity = parseInt(quantityInput) || 1;

  const addressName = formData.get("addressName") as string;
  const addressLine1 = formData.get("addressLine1") as string;
  const addressLine2 = formData.get("addressLine2") as string;
  const addressCity = formData.get("addressCity") as string;
  const addressState = formData.get("addressState") as string;
  const addressZip = formData.get("addressZip") as string;
  const addressPhone = formData.get("addressPhone") as string;

  if (!fabricId || !sampleOptionId || !addressName || !addressLine1 || !addressCity || !addressState || !addressZip || !addressPhone) {
    return { error: "Please fill in all required delivery details." };
  }

  try {
    // Retrieve fabric & option from database (AUTHORITATIVE pricing)
    const fabric = await db.fabric.findUnique({
      where: { id: fabricId, status: "PUBLISHED" },
      include: { sampleOptions: true, supplier: true },
    });

    if (!fabric) {
      return { error: "Fabric not found or unavailable." };
    }

    const option = fabric.sampleOptions.find((opt) => opt.id === sampleOptionId);
    if (!option) {
      return { error: "Selected sample option is invalid." };
    }

    const samplePrice = option.price;
    const shippingPrice = 60.00; // Flat flat shipping rate
    const totalPrice = (samplePrice.toNumber() * quantity) + shippingPrice;

    const orderId = generateSampleOrderId();

    // Create the Sample Order
    const order = await db.sampleOrder.create({
      data: {
        id: orderId,
        buyerId: currentUser.buyerProfile.id,
        supplierId: fabric.supplierId,
        fabricId: fabric.id,
        sampleOptionId: option.id,
        quantity,
        samplePrice,
        shippingPrice,
        totalPrice,
        shippingAddressName: addressName,
        shippingAddressLine1: addressLine1,
        shippingAddressLine2: addressLine2 || null,
        shippingAddressCity: addressCity,
        shippingAddressState: addressState,
        shippingAddressZip: addressZip,
        shippingAddressPhone: addressPhone,
        status: "PAYMENT_PENDING",
      },
    });

    // Notify Supplier
    await db.notification.create({
      data: {
        userId: fabric.supplier.userId,
        text: `New sample request ${orderId} created for ${fabric.name}. Awaiting payment verification.`,
        type: "SAMPLE_ORDER_CREATED",
        link: "/supplier/sample-requests",
      },
    });

    // Redirect to payment step
    redirect(`/checkout/sample/payment?orderId=${orderId}`);
  } catch (error: any) {
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Create sample order error:", error);
    return { error: "Failed to create sample order. Please try again." };
  }
}

export async function submitSamplePaymentAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "BUYER" || !currentUser.buyerProfile) {
    return { error: "Unauthorized." };
  }

  const orderId = formData.get("orderId") as string;
  const utr = formData.get("utr") as string;
  const screenshotFile = formData.get("screenshot") as File;

  if (!orderId || !utr || !screenshotFile || screenshotFile.size === 0) {
    return { error: "Please enter your UTR number and upload the payment receipt screenshot." };
  }

  try {
    const order = await db.sampleOrder.findUnique({
      where: { id: orderId },
      include: { fabric: true },
    });

    if (!order || order.buyerId !== currentUser.buyerProfile.id) {
      return { error: "Order not found." };
    }

    // Upload file
    const screenshotUrl = await uploadFile(screenshotFile);

    // Update order status
    await db.$transaction([
      db.sampleOrder.update({
        where: { id: orderId },
        data: {
          utr,
          paymentScreenshotUrl: screenshotUrl,
          status: "PAYMENT_VERIFICATION",
          paymentStatus: "VERIFICATION_PENDING",
        },
      }),
      // Audit log
      db.auditLog.create({
        data: {
          actorId: currentUser.id,
          action: "PAYMENT_SUBMITTED",
          entityType: "SampleOrder",
          entityId: orderId,
          newState: "PAYMENT_VERIFICATION",
        },
      }),
    ]);

    // Send notifications to Admin and Supplier
    const admins = await db.user.findMany({ where: { role: "ADMIN" } });
    for (const ad of admins) {
      await db.notification.create({
        data: {
          userId: ad.id,
          text: `Payment verification request submitted for Sample Order ${orderId}.`,
          type: "PAYMENT_VERIFICATION_PENDING",
          link: "/admin/payments",
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Submit payment error:", error);
    return { error: "Failed to submit payment verification. Please try again." };
  }
}
