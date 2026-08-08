import { PrismaClient, FabricStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding...");

  // Clean the database
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.dispute.deleteMany({});
  await prisma.bulkOrder.deleteMany({});
  await prisma.offer.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.negotiation.deleteMany({});
  await prisma.rFQ.deleteMany({});
  await prisma.sampleOrder.deleteMany({});
  await prisma.savedFabric.deleteMany({});
  await prisma.savedSupplier.deleteMany({});
  await prisma.catalogueFabric.deleteMany({});
  await prisma.catalogue.deleteMany({});
  await prisma.fabricSampleOption.deleteMany({});
  await prisma.fabricImage.deleteMany({});
  await prisma.fabric.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.buyerProfile.deleteMany({});
  await prisma.supplierProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.systemSettings.deleteMany({});

  console.log("Database cleaned.");

  // Password hashes
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const supplierPasswordHash = await bcrypt.hash("supplier123", 10);
  const buyerPasswordHash = await bcrypt.hash("buyer123", 10);

  // 1. Create System Settings
  await prisma.systemSettings.create({
    data: {
      id: "global",
      globalCommissionRate: 0.02,
      upiId: "surattextile@okaxis",
      upiQrUrl: "https://res.cloudinary.com/demo/image/upload/v1622549216/sample.jpg", // dummy QR
      bankInstructions: "Bank: HDFC Bank Ltd\nAccount Number: 50200067341209\nIFSC: HDFC0000060\nBranch: Ring Road, Surat\nName: Surat B2B Textile Hub",
    },
  });

  // 2. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@textile.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // 3. Create Buyers
  const buyerUser1 = await prisma.user.create({
    data: {
      email: "designer_boutique@textile.com",
      passwordHash: buyerPasswordHash,
      role: "BUYER",
    },
  });

  const buyerProfile1 = await prisma.buyerProfile.create({
    data: {
      userId: buyerUser1.id,
      businessName: "Aria Designs",
      contactName: "Ananya Sharma",
      businessType: "Designer Boutique",
      location: "Mumbai, Maharashtra",
      address: "Studio 4B, Colaba Causeway, Behind HDFC Bank, Mumbai - 400005",
    },
  });

  const buyerUser2 = await prisma.user.create({
    data: {
      email: "d2c_brand@textile.com",
      passwordHash: buyerPasswordHash,
      role: "BUYER",
    },
  });

  const buyerProfile2 = await prisma.buyerProfile.create({
    data: {
      userId: buyerUser2.id,
      businessName: "Zara Fashion Labs",
      contactName: "Kabir Mehta",
      businessType: "D2C Fashion Brand",
      location: "Bangalore, Karnataka",
      address: "102, HSR Layout, Sector 3, Outer Ring Road, Bangalore - 560102",
    },
  });

  // 4. Create Suppliers
  const supplierUser1 = await prisma.user.create({
    data: {
      email: "surat_fabrics@textile.com",
      passwordHash: supplierPasswordHash,
      role: "SUPPLIER",
    },
  });

  const supplierProfile1 = await prisma.supplierProfile.create({
    data: {
      userId: supplierUser1.id,
      businessName: "Surat Fabrics Co.",
      contactName: "Rajesh Gajiwala",
      businessType: "Textile Mill",
      location: "Surat, Gujarat",
      address: "Plot 104-106, GIDC Pandesara, Surat - 394221",
      description: "Leading manufacturers of high-speed Korean BSY, Rayon, and premium Crepe fabrics. Established in 1998, with 200+ water jet looms.",
      supplierType: "MANUFACTURER",
      gstin: "24AAACS1234A1Z5",
      pan: "AAACS1234A",
      status: "VERIFIED",
    },
  });

  const supplierUser2 = await prisma.user.create({
    data: {
      email: "mahalaxmi_tex@textile.com",
      passwordHash: supplierPasswordHash,
      role: "SUPPLIER",
    },
  });

  const supplierProfile2 = await prisma.supplierProfile.create({
    data: {
      userId: supplierUser2.id,
      businessName: "Mahalaxmi Textiles",
      contactName: "Dilip Bhakuni",
      businessType: "Trading House",
      location: "Surat, Gujarat",
      address: "Shop 2050, New Textile Market (NTM), Ring Road, Surat - 395002",
      description: "Wholesale traders of Cambric Cotton, Lycra, and Satin fabrics. Specializing in ready stock digital print base fabrics.",
      supplierType: "TRADER",
      gstin: "24AABCM5678B2Z1",
      pan: "AABCM5678B",
      status: "VERIFIED",
    },
  });

  const supplierUser3 = await prisma.user.create({
    data: {
      email: "shree_prints@textile.com",
      passwordHash: supplierPasswordHash,
      role: "SUPPLIER",
    },
  });

  const supplierProfile3 = await prisma.supplierProfile.create({
    data: {
      userId: supplierUser3.id,
      businessName: "Shree Prints & Processors",
      contactName: "Vinod Chokshi",
      businessType: "Printing Mill",
      location: "Surat, Gujarat",
      address: "Survey No. 42, Near Sachin GIDC, Surat - 394230",
      description: "Specialized in rotary and high-speed digital printing on viscose rayon, cotton, and georgette fabrics.",
      supplierType: "WHOLESALER",
      gstin: "24AACCS9012C3Z0",
      pan: "AACCS9012C",
      status: "VERIFIED",
    },
  });

  const supplierUser4 = await prisma.user.create({
    data: {
      email: "ambaji_creations@textile.com",
      passwordHash: supplierPasswordHash,
      role: "SUPPLIER",
    },
  });

  const supplierProfile4 = await prisma.supplierProfile.create({
    data: {
      userId: supplierUser4.id,
      businessName: "Ambaji Creations",
      contactName: "Sanjay Patel",
      businessType: "Weaving Unit",
      location: "Surat, Gujarat",
      address: "B-201, J J Textile Market, Ring Road, Surat - 395002",
      description: "Manufacturers of polyester chiffon, georgette, and organza. Seeking verification.",
      supplierType: "MANUFACTURER",
      gstin: "24AADCP3456D4Z9",
      pan: "ADCP3456D",
      status: "PENDING", // PENDING approval
    },
  });

  const supplierUser5 = await prisma.user.create({
    data: {
      email: "tirupati_tex@textile.com",
      passwordHash: supplierPasswordHash,
      role: "SUPPLIER",
    },
  });

  const supplierProfile5 = await prisma.supplierProfile.create({
    data: {
      userId: supplierUser5.id,
      businessName: "Tirupati Tex",
      contactName: "Manoj Agarwal",
      businessType: "Wholesale Agent",
      location: "Surat, Gujarat",
      address: "411, Millennium Textile Market, Ring Road, Surat - 395002",
      description: "Deals in Viscose Satin, Crepe, and Lycra. Over 15 years of supply history to large export houses.",
      supplierType: "TRADER",
      gstin: "24AAECA7890E5Z8",
      pan: "AECA7890E",
      status: "VERIFIED",
    },
  });

  // 5. Create Categories
  const categoriesData = [
    { name: "Cotton", slug: "cotton" },
    { name: "Rayon", slug: "rayon" },
    { name: "Polyester", slug: "polyester" },
    { name: "Viscose", slug: "viscose" },
    { name: "Linen", slug: "linen" },
    { name: "Nylon", slug: "nylon" },
    { name: "Georgette", slug: "georgette" },
    { name: "Cambric", slug: "cambric" },
    { name: "Lycra", slug: "lycra" },
    { name: "BSY", slug: "bsy" },
    { name: "Crepe", slug: "crepe" },
    { name: "Satin", slug: "satin" },
  ];

  const categoriesMap: { [key: string]: any } = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: cat,
    });
    categoriesMap[cat.name] = createdCat;
  }

  // 6. Create Fabrics
  const fabricsData = [
    {
      fabricId: "STF-001001",
      name: "Korean BSY 120GSM Black",
      slug: "korean-bsy-120gsm-black",
      description: "Premium Korean BSY (Bi-Shrinkage Yarn) fabric. Highly durable, wrinkle-resistant, and perfect for digital printing and ladies' kurtis, dresses, and abayas. Excellent drape and silk-like soft hand feel.",
      price: 48.50,
      unit: "metre",
      moq: 1000,
      gsm: 120,
      width: 44,
      composition: "100% Polyester BSY",
      material: "Polyester",
      stretch: "Non-stretch",
      finish: "Soft Silk Touch",
      pattern: "Solid",
      colors: ["Black", "Navy Blue", "Dark Wine", "Emerald Green"],
      useCases: ["Digital printing", "Garments", "Dresses", "Kurtis"],
      productionTime: 12,
      sampleAvailable: true,
      status: "PUBLISHED",
      supplierId: supplierProfile1.id,
      categoryId: categoriesMap["BSY"].id,
      images: [
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      fabricId: "STF-001002",
      name: "Liva Approved Viscose Rayon 140GSM",
      slug: "liva-approved-viscose-rayon-140gsm",
      description: "Super soft, Liva-approved viscose rayon fabric. High absorbency and fluidity, making it the most preferred fabric for ethnic shirts, kurtis, jumpsuits, and casual dresses.",
      price: 65.00,
      unit: "metre",
      moq: 500,
      gsm: 140,
      width: 44,
      composition: "100% Viscose Rayon",
      material: "Viscose",
      stretch: "Non-stretch",
      finish: "Regular",
      pattern: "Solid",
      colors: ["Off-white", "Golden Yellow", "Crimson Red", "Jet Black"],
      useCases: ["Garments", "Kurtis", "Sarees", "Dresses"],
      productionTime: 15,
      sampleAvailable: true,
      status: "PUBLISHED",
      supplierId: supplierProfile1.id,
      categoryId: categoriesMap["Rayon"].id,
      images: [
        "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      fabricId: "STF-001003",
      name: "Premium Cambric Cotton 60s",
      slug: "premium-cambric-cotton-60s",
      description: "Fine, closely woven combed cotton fabric with a slight gloss. Ideally suited for hand block printing and manufacturing high-quality summer shirts, kurtis, and linings.",
      price: 55.00,
      unit: "metre",
      moq: 1000,
      gsm: 80,
      width: 44,
      composition: "100% Combed Cotton",
      material: "Cotton",
      stretch: "Non-stretch",
      finish: "Mercerized",
      pattern: "Solid",
      colors: ["Pure White", "Beige", "Sky Blue", "Light Pink"],
      useCases: ["Garments", "Shirts", "Kurtis", "Screen printing"],
      productionTime: 10,
      sampleAvailable: true,
      status: "PUBLISHED",
      supplierId: supplierProfile2.id,
      categoryId: categoriesMap["Cambric"].id,
      images: [
        "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      fabricId: "STF-001004",
      name: "Dull Satin 130GSM Heavy Drape",
      slug: "dull-satin-130gsm-heavy-drape",
      description: "Low-lustre satin fabric with a rich, heavy drape. Feels luxurious against the skin. Excellent for fashion evening wear, designer blouses, and premium brand shirts.",
      price: 78.00,
      unit: "metre",
      moq: 500,
      gsm: 130,
      width: 58,
      composition: "100% Polyester Satin",
      material: "Satin",
      stretch: "Non-stretch",
      finish: "Dull Matte Satin",
      pattern: "Solid",
      colors: ["Dusty Rose", "Champagne", "Mauve", "Midnight Blue"],
      useCases: ["Garments", "Dresses", "Shirts"],
      productionTime: 18,
      sampleAvailable: true,
      status: "PUBLISHED",
      supplierId: supplierProfile2.id,
      categoryId: categoriesMap["Satin"].id,
      images: [
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      fabricId: "STF-001005",
      name: "Four-way Stretch Lycra 180GSM",
      slug: "four-way-stretch-lycra-180gsm",
      description: "High stretch spandex blend fabric. Highly resilient, quick-dry, and holds its shape perfectly. Ideal for leggings, sportswear, gym wear, and bodycon dresses.",
      price: 110.00,
      unit: "metre",
      moq: 300,
      gsm: 180,
      width: 60,
      composition: "92% Polyester, 8% Spandex",
      material: "Lycra",
      stretch: "4-way Stretch",
      finish: "Soft Matte",
      pattern: "Solid",
      colors: ["Sports Black", "Charcoal Grey", "Navy Green", "Royal Blue"],
      useCases: ["Garments", "Dresses"],
      productionTime: 14,
      sampleAvailable: true,
      status: "PUBLISHED",
      supplierId: supplierProfile5.id,
      categoryId: categoriesMap["Lycra"].id,
      images: [
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      fabricId: "STF-001006",
      name: "Pure Georgette 60g Loom State",
      slug: "pure-georgette-60g-loom-state",
      description: "Fine, crinkled sheer fabric. Weaved from highly twisted yarns. Perfect for hand dyeing, custom printing, bridal dupattas, and designer sarees.",
      price: 125.00,
      unit: "metre",
      moq: 400,
      gsm: 60,
      width: 44,
      composition: "100% Viscose Georgette",
      material: "Georgette",
      stretch: "Non-stretch",
      finish: "Loom State (Ready for Dye)",
      pattern: "Solid",
      colors: ["Natural Greige (Dyeable)"],
      useCases: ["Sarees", "Dresses", "Digital printing"],
      productionTime: 20,
      sampleAvailable: true,
      status: "PUBLISHED",
      supplierId: supplierProfile3.id,
      categoryId: categoriesMap["Georgette"].id,
      images: [
        "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      fabricId: "STF-001007",
      name: "Crepe de Chine 100GSM Printed",
      slug: "crepe-de-chine-100gsm-printed",
      description: "Flowy, crinkled crepe fabric with custom digital prints. Vibrant colors and excellent color fastness. Best suited for high-fashion boutique dresses and shirts.",
      price: 85.00,
      unit: "metre",
      moq: 600,
      gsm: 100,
      width: 44,
      composition: "100% Silk-Touch Polyester",
      material: "Crepe",
      stretch: "Natural stretch",
      finish: "Crepe finish",
      pattern: "Floral / Abstract",
      colors: ["Multicolor Print"],
      useCases: ["Dresses", "Kurtis", "Garments", "Digital printing"],
      productionTime: 15,
      sampleAvailable: true,
      status: "PUBLISHED",
      supplierId: supplierProfile3.id,
      categoryId: categoriesMap["Crepe"].id,
      images: [
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      fabricId: "STF-001008",
      name: "Ambaji Chiffon Georgette (Pending)",
      slug: "ambaji-chiffon-georgette-pending",
      description: "Fine quality georgette. Beautiful flowy drape, semi-sheer finish. This listing is pending approval for testing purposes.",
      price: 42.00,
      unit: "metre",
      moq: 1500,
      gsm: 55,
      width: 44,
      composition: "100% Polyester",
      material: "Georgette",
      stretch: "Non-stretch",
      finish: "Soft Chiffon",
      pattern: "Solid",
      colors: ["Yellow", "Orange", "Pink"],
      useCases: ["Sarees", "Dresses"],
      productionTime: 25,
      sampleAvailable: true,
      status: "PENDING_APPROVAL", // PENDING MODERATION
      supplierId: supplierProfile4.id,
      categoryId: categoriesMap["Georgette"].id,
      images: [
        "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80"
      ]
    }
  ];

  for (const fab of fabricsData) {
    const { images, ...fabRest } = fab;
    const createdFabric = await prisma.fabric.create({
      data: {
        ...fabRest,
        status: fabRest.status as FabricStatus,
        images: {
          create: images.map(url => ({ url }))
        },
        // 7. Seed Sample Options for each fabric
        sampleOptions: {
          create: [
            {
              name: "1 Metre Cut",
              description: "A continuous 1-metre cut to check weight, drape, and texture.",
              size: `${fabRest.width} inches x 1.09 yards`,
              price: fabRest.price + 20, // slightly higher price for samples
            },
            {
              name: "Large Swatch (50x50 cm)",
              description: "Perfect size for lab dip and washing/shrinkage tests.",
              size: "50 cm x 50 cm",
              price: 35.00,
            },
            {
              name: "Standard Swatch (20x20 cm)",
              description: "Hand feel card sample.",
              size: "20 cm x 20 cm",
              price: 15.00,
            }
          ]
        }
      }
    });

    console.log(`Created fabric: ${createdFabric.name} (${createdFabric.fabricId})`);
  }

  // 8. Create a pre-made catalogue for Supplier 1 (Surat Fabrics Co.)
  const sub1Fabrics = await prisma.fabric.findMany({
    where: { supplierId: supplierProfile1.id }
  });

  const catalogue = await prisma.catalogue.create({
    data: {
      name: "Premium Viscose & BSY Collection 2026",
      slug: "premium-viscose-bsy-collection-2026",
      coverImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      description: "Direct mill stock of our top running fabrics. Quality guaranteed by Surat Fabrics Co.",
      isPublic: true,
      supplierId: supplierProfile1.id,
    }
  });

  for (const fab of sub1Fabrics) {
    await prisma.catalogueFabric.create({
      data: {
        catalogueId: catalogue.id,
        fabricId: fab.id
      }
    });
  }

  console.log(`Created catalogue: ${catalogue.name}`);

  // 9. Seed a Completed Transaction Cycle to populate metrics & review examples
  // We will seed:
  // - A completed sample order
  // - An RFQ
  // - A negotiation with an accepted offer
  // - A completed bulk order with a 2% commission and a review
  const testFabric = await prisma.fabric.findFirstOrThrow({
    where: { fabricId: "STF-001001" },
    include: { sampleOptions: true }
  });

  const sampleOption = testFabric.sampleOptions[0];

  // Seed sample order
  const sampleOrder = await prisma.sampleOrder.create({
    data: {
      id: "SO-001089",
      buyerId: buyerProfile1.id,
      supplierId: supplierProfile1.id,
      fabricId: testFabric.id,
      sampleOptionId: sampleOption.id,
      quantity: 1,
      samplePrice: sampleOption.price,
      shippingPrice: 60.00,
      totalPrice: sampleOption.price.toNumber() + 60.00,
      shippingAddressName: "Ananya Sharma",
      shippingAddressLine1: "Studio 4B, Colaba Causeway",
      shippingAddressCity: "Mumbai",
      shippingAddressState: "Maharashtra",
      shippingAddressZip: "400005",
      shippingAddressPhone: "9876543210",
      status: "COMPLETED",
      utr: "UTR9876543210",
      paymentScreenshotUrl: "https://res.cloudinary.com/demo/image/upload/v1622549216/sample.jpg",
      paymentStatus: "VERIFIED",
      paymentVerifiedAt: new Date(),
      paymentVerifiedBy: admin.id,
      courierName: "Delhivery B2B",
      trackingId: "DLV1234567",
      trackingUrl: "https://www.delhivery.com/",
    }
  });

  // Seed RFQ
  const rfq = await prisma.rFQ.create({
    data: {
      id: "RFQ-001029",
      buyerId: buyerProfile1.id,
      supplierId: supplierProfile1.id,
      fabricId: testFabric.id,
      quantity: 10000,
      unit: "metre",
      color: "Black",
      requiredDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      deliveryLocation: "Mumbai",
      targetPrice: 45.00,
      requirements: "Must be packed in water-resistant polythene tubes of 50m roll each.",
      status: "ACCEPTED",
    }
  });

  // Seed Negotiation
  const negotiation = await prisma.negotiation.create({
    data: {
      rfqId: rfq.id,
      buyerId: buyerProfile1.id,
      supplierId: supplierProfile1.id,
    }
  });

  // Seed messages
  await prisma.message.createMany({
    data: [
      {
        negotiationId: negotiation.id,
        senderRole: "BUYER",
        text: "Hi Rajesh, we received the 1m sample for Korean BSY (STF-001001) and liked the quality. We need 10,000 metres in Jet Black. Can you provide it at ₹45/m?",
      },
      {
        negotiationId: negotiation.id,
        senderRole: "SUPPLIER",
        text: "Hi Ananya, glad you liked the sample. For 10,000m of Korean BSY Black, our cost is tight. The best we can do is ₹51/m.",
      },
      {
        negotiationId: negotiation.id,
        senderRole: "BUYER",
        text: "Could you meet us in the middle at ₹48/m? We plan to order regularly if the bulk batch is good.",
      }
    ]
  });

  // Seed structured offers
  const supplierOffer = await prisma.offer.create({
    data: {
      id: "OFFER-001201",
      rfqId: rfq.id,
      negotiationId: negotiation.id,
      createdBy: "SUPPLIER",
      pricePerMetre: 51.00,
      quantity: 10000,
      subtotal: 510000.00,
      shippingCharge: 10000.00,
      total: 520000.00,
      productionDays: 14,
      offerValidity: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: "Rotary dyed Jet Black BSY fabric.",
      status: "COUNTERED"
    }
  });

  const finalAcceptedOffer = await prisma.offer.create({
    data: {
      id: "OFFER-001202",
      rfqId: rfq.id,
      negotiationId: negotiation.id,
      createdBy: "SUPPLIER",
      pricePerMetre: 48.00,
      quantity: 10000,
      subtotal: 480000.00,
      shippingCharge: 8000.00,
      total: 488000.00,
      productionDays: 12,
      offerValidity: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      notes: "Agreed ₹48/m for bulk order of 10,000m.",
      status: "ACCEPTED"
    }
  });

  // Seed Bulk Order
  const bulkOrder = await prisma.bulkOrder.create({
    data: {
      id: "B-001029",
      buyerId: buyerProfile1.id,
      supplierId: supplierProfile1.id,
      fabricId: testFabric.id,
      fabricNameSnapshot: testFabric.name,
      fabricIdSnapshot: testFabric.fabricId,
      fabricDescSnapshot: testFabric.description,
      quantity: 10000,
      unit: "metre",
      pricePerUnit: 48.00,
      subtotal: 480000.00,
      shipping: 8000.00,
      total: 488000.00,
      productionTime: 12,
      offerId: finalAcceptedOffer.id,
      rfqId: rfq.id,
      status: "COMPLETED",
      shippingAddressName: "Ananya Sharma",
      shippingAddressLine1: "Studio 4B, Colaba Causeway",
      shippingAddressCity: "Mumbai",
      shippingAddressState: "Maharashtra",
      shippingAddressZip: "400005",
      shippingAddressPhone: "9876543210",
      utr: "UTR8839021873921",
      paymentScreenshotUrl: "https://res.cloudinary.com/demo/image/upload/v1622549216/sample.jpg",
      paymentStatus: "VERIFIED",
      paymentVerifiedAt: new Date(),
      paymentVerifiedBy: admin.id,
      courierName: "V-Trans Logistics",
      trackingId: "VT987216392",
      trackingUrl: "https://www.vtransgroup.com/",
      shippedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      inspectionEndsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      commissionRate: 0.02,
      commissionAmount: 9600.00, // 2% of 480,000 subtotal
    }
  });

  // Seed Review
  await prisma.review.create({
    data: {
      type: "BULK",
      bulkOrderId: bulkOrder.id,
      buyerId: buyerProfile1.id,
      fabricId: testFabric.id,
      supplierId: supplierProfile1.id,
      ratingFabricQuality: 5,
      ratingMatchesSample: 5,
      ratingDelivery: 4,
      ratingCommunication: 5,
      comment: "Excellent quality Korean BSY. Drape matches sample perfectly. Rajesh was very cooperative in negotiation. Highly recommend!",
    }
  });

  // Create an active saved fabric for the buyer
  await prisma.savedFabric.create({
    data: {
      buyerId: buyerProfile1.id,
      fabricId: testFabric.id
    }
  });

  // Seed some in-app notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: buyerUser1.id,
        text: "Your payment for Sample Order SO-001089 was verified.",
        type: "PAYMENT_VERIFIED",
        link: "/buyer/samples"
      },
      {
        userId: supplierUser1.id,
        text: "New Bulk Order B-001029 has been created.",
        type: "BULK_ORDER_CREATED",
        link: "/supplier/bulk-orders"
      }
    ]
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
