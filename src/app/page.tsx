import React from "react";
import { db } from "@/lib/db";
import HomepageClient from "./HomepageClient";

export default async function HomePage() {
  // Fetch published fabrics
  const fabrics = await db.fabric.findMany({
    where: { status: "PUBLISHED" },
    include: {
      supplier: true,
      category: true,
      images: { take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  // Fetch verified suppliers
  const suppliers = await db.supplierProfile.findMany({
    where: { status: "VERIFIED" },
    take: 4,
  });

  // Fetch top-level categories containing their immediate child subcategories
  const categories = await db.category.findMany({
    where: {
      parentId: null,
      isActive: true,
    },
    include: {
      subcategories: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <HomepageClient
      fabrics={fabrics}
      suppliers={suppliers}
      categories={categories}
    />
  );
}
