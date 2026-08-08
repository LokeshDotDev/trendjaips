"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setAuthCookie, clearAuthCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please fill in all fields." };
  }

  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        buyerProfile: true,
        supplierProfile: true,
      },
    });

    if (!user) {
      return { error: "Invalid email or password." };
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return { error: "Invalid email or password." };
    }

    // Set JWT auth cookie
    await setAuthCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Redirect depending on role
    if (user.role === "ADMIN") {
      redirect("/admin");
    } else if (user.role === "SUPPLIER") {
      redirect("/supplier");
    } else {
      redirect("/buyer");
    }
  } catch (error: any) {
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error; // Let Next.js handle redirect
    }
    console.error("Login error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  const role = formData.get("role") as string; // BUYER or SUPPLIER
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const businessName = formData.get("businessName") as string;
  const contactName = formData.get("contactName") as string;
  const businessType = formData.get("businessType") as string;
  const location = formData.get("location") as string;
  const address = formData.get("address") as string;

  // Supplier specific fields
  const supplierType = formData.get("supplierType") as string; // MANUFACTURER, TRADER, WHOLESALER
  const description = formData.get("description") as string;
  const gstin = formData.get("gstin") as string;
  const pan = formData.get("pan") as string;

  if (!email || !password || !businessName || !contactName || !location || !address) {
    return { error: "Please fill in all required fields." };
  }

  if (role === "SUPPLIER" && (!supplierType || !description)) {
    return { error: "Please fill in all supplier profile details." };
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "Email is already registered." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and profile in a transaction
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          role: role === "SUPPLIER" ? "SUPPLIER" : "BUYER",
        },
      });

      if (role === "SUPPLIER") {
        await tx.supplierProfile.create({
          data: {
            userId: newUser.id,
            businessName,
            contactName,
            businessType,
            location,
            address,
            description,
            supplierType: supplierType as any,
            gstin: gstin || null,
            pan: pan || null,
            status: "PENDING", // Admin must verify
          },
        });
      } else {
        await tx.buyerProfile.create({
          data: {
            userId: newUser.id,
            businessName,
            contactName,
            businessType,
            location,
            address,
          },
        });
      }

      return newUser;
    });

    // Set auth cookie
    await setAuthCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Redirect
    if (user.role === "SUPPLIER") {
      redirect("/supplier");
    } else {
      redirect("/buyer");
    }
  } catch (error: any) {
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Registration error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect("/");
}
