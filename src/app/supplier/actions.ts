"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function generateFabricId() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `STF-${rand}`;
}

export async function addFabricAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "SUPPLIER" || !currentUser.supplierProfile) {
    return { error: "Unauthorized. Supplier account required." };
  }

  const profile = currentUser.supplierProfile;
  if (profile.status !== "VERIFIED") {
    return { error: "Only verified suppliers can publish/sell fabrics." };
  }

  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  const description = formData.get("description") as string;
  const priceInput = formData.get("price") as string;
  const unit = formData.get("unit") as string || "metre";
  const moqInput = formData.get("moq") as string;
  const gsmInput = formData.get("gsm") as string;
  const widthInput = formData.get("width") as string;
  const composition = formData.get("composition") as string;
  const material = formData.get("material") as string;
  const stretch = formData.get("stretch") as string || "Non-stretch";
  const finish = formData.get("finish") as string || "Regular";
  const pattern = formData.get("pattern") as string || "Solid";
  const productionTimeInput = formData.get("productionTime") as string;

  // Colors & use cases parsed from CSV
  const colorsInput = formData.get("colors") as string;
  const useCasesInput = formData.get("useCases") as string;

  const colors = colorsInput ? colorsInput.split(",").map((c) => c.trim()).filter(Boolean) : [];
  const useCases = useCasesInput ? useCasesInput.split(",").map((u) => u.trim()).filter(Boolean) : [];

  if (!name || !categoryId || !description || !priceInput || !moqInput || !gsmInput || !widthInput || !composition || !material || !productionTimeInput) {
    return { error: "Please fill in all required fabric fields." };
  }

  const price = parseFloat(priceInput);
  const moq = parseInt(moqInput);
  const gsm = parseInt(gsmInput);
  const width = parseInt(widthInput);
  const productionTime = parseInt(productionTimeInput);

  if (isNaN(price) || isNaN(moq) || isNaN(gsm) || isNaN(width) || isNaN(productionTime)) {
    return { error: "Please enter valid numeric specifications." };
  }

  try {
    const fabricId = generateFabricId();
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    await db.$transaction(async (tx) => {
      // 1. Create Fabric
      const fabric = await tx.fabric.create({
        data: {
          fabricId,
          name,
          slug,
          description,
          price,
          unit,
          moq,
          gsm,
          width,
          composition,
          material,
          stretch,
          finish,
          pattern,
          colors,
          useCases,
          productionTime,
          sampleAvailable: true,
          status: "PENDING_APPROVAL", // Goes to admin approval queue
          supplierId: profile.id,
          categoryId,
        },
      });

      // 2. Add standard sample options
      await tx.fabricSampleOption.createMany({
        data: [
          {
            fabricId: fabric.id,
            name: "1 Metre Cut",
            description: "Continuous 1-metre cut to check drape, handle and texture.",
            size: `${width} inches x 1.09 yards`,
            price: price + 20,
          },
          {
            fabricId: fabric.id,
            name: "Large Swatch (50x50 cm)",
            description: "Suitable for lab dips and washing shrinkage tests.",
            size: "50 cm x 50 cm",
            price: 35.00,
          },
          {
            fabricId: fabric.id,
            name: "Standard Swatch (20x20 cm)",
            description: "Hand feel card sample.",
            size: "20 cm x 20 cm",
            price: 15.00,
          },
        ],
      });

      // 3. Add default fabric placeholder image
      await tx.fabricImage.create({
        data: {
          fabricId: fabric.id,
          url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
        },
      });

      // 4. Notify admin
      const admins = await tx.user.findMany({ where: { role: "ADMIN" } });
      for (const ad of admins) {
        await tx.notification.create({
          data: {
            userId: ad.id,
            text: `New fabric listing ${name} (${fabricId}) submitted by ${profile.businessName} awaits moderation.`,
            type: "FABRIC_MODERATION_PENDING",
            link: "/admin/fabrics",
          },
        });
      }
    });
  } catch (error) {
    console.error("Add fabric error:", error);
    return { error: "Failed to submit fabric listing. Please check input parameters." };
  }

  revalidatePath("/supplier/fabrics");
  redirect("/supplier/fabrics");
}

export async function updateSampleOrderStateAction(
  orderId: string,
  newState: "SUPPLIER_PREPARING" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "COMPLETED",
  courierName?: string,
  trackingId?: string,
  trackingUrl?: string
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPPLIER" && user.role !== "ADMIN")) {
    return { error: "Unauthorized." };
  }

  try {
    const order = await db.sampleOrder.findUnique({
      where: { id: orderId },
      include: { buyer: true },
    });

    if (!order) return { error: "Sample order not found." };

    // Supplier can only modify their own orders
    if (user.role === "SUPPLIER" && order.supplierId !== user.supplierProfile?.id) {
      return { error: "Unauthorized order mismatch." };
    }

    // Server side safety rule check: "Supplier cannot fulfil an unpaid order"
    if (order.status === "PAYMENT_PENDING" || order.status === "PAYMENT_VERIFICATION") {
      return { error: "Cannot ship or fulfill an order until payment is verified by Admin." };
    }

    const data: any = {
      status: newState,
    };

    if (courierName) data.courierName = courierName;
    if (trackingId) data.trackingId = trackingId;
    if (trackingUrl) data.trackingUrl = trackingUrl;

    await db.$transaction([
      db.sampleOrder.update({
        where: { id: orderId },
        data,
      }),
      db.auditLog.create({
        data: {
          actorId: user.id,
          action: "SAMPLE_ORDER_STATUS_CHANGED",
          entityType: "SampleOrder",
          entityId: orderId,
          oldState: order.status,
          newState,
        },
      }),
      db.notification.create({
        data: {
          userId: order.buyer.userId,
          text: `Your Sample Order ${orderId} has been updated to: ${newState.replace(/_/g, " ")}.`,
          type: "SAMPLE_STATUS_UPDATE",
          link: "/buyer/samples",
        },
      }),
    ]);

    revalidatePath(`/supplier/samples`);
    revalidatePath(`/buyer/samples`);
    return { success: true };
  } catch (error) {
    console.error("Update sample state error:", error);
    return { error: "Failed to update order state." };
  }
}
