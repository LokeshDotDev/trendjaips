"use server";

import { db } from "@/lib/db";
import { getCurrentUser, setAuthCookie } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

function generateSampleOrderId() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `SO-${rand}`;
}

export async function createSampleOrderAction(prevState: any, formData: FormData) {
  let currentUser = await getCurrentUser();
  let buyerProfileId = "";

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

  // Guest Details
  const guestName = formData.get("guestName") as string;
  const guestEmail = formData.get("guestEmail") as string;

  if (!currentUser) {
    if (!guestName || !guestEmail) {
      return { error: "Please fill in your name and email for guest checkout." };
    }

    try {
      const emailLower = guestEmail.toLowerCase();
      // Check if email already exists
      const existingUser = await db.user.findUnique({
        where: { email: emailLower }
      });
      if (existingUser) {
        return { error: "An account with this email already exists. Please sign in to place your order." };
      }

      // Automatically create buyer account
      const defaultPasswordHash = await bcrypt.hash("guest123", 10);
      const guestResult = await db.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: emailLower,
            passwordHash: defaultPasswordHash,
            role: "BUYER"
          }
        });

        const newProfile = await tx.buyerProfile.create({
          data: {
            userId: newUser.id,
            businessName: addressName || guestName,
            contactName: guestName,
            businessType: "B2B Guest Buyer",
            location: `${addressCity}, ${addressState}`,
            address: `${addressLine1} ${addressLine2 || ""}`.trim()
          }
        });

        return { newUser, newProfile };
      });

      // Login the guest user immediately
      await setAuthCookie({
        userId: guestResult.newUser.id,
        email: guestResult.newUser.email,
        role: guestResult.newUser.role
      });

      buyerProfileId = guestResult.newProfile.id;
    } catch (err) {
      console.error("Guest registration error:", err);
      return { error: "Failed to set up guest buyer profile. Please try again." };
    }
  } else {
    if (currentUser.role !== "BUYER" || !currentUser.buyerProfile) {
      return { error: "Unauthorized. Please log in as a buyer." };
    }
    buyerProfileId = currentUser.buyerProfile.id;
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
        buyerId: buyerProfileId,
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

export async function activateGuestAccountAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Session expired. Please log in." };
  }

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { error: "Please enter both password fields." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await db.user.update({
      where: { id: currentUser.id },
      data: { passwordHash }
    });
    return { success: true };
  } catch (err) {
    console.error("Activate password error:", err);
    return { error: "Failed to update password. Please try again." };
  }
}
