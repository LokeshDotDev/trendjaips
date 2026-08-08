import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ShieldCheck, MapPin, Package, Clock, Layers, Award, Sparkles, SendHorizontal } from "lucide-react";

interface FabricDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function FabricDetailPage({ params }: FabricDetailPageProps) {
  const { slug } = await params;

  // Fetch fabric details
  const fabric = await db.fabric.findUnique({
    where: { slug },
    include: {
      supplier: true,
      category: true,
      images: true,
      sampleOptions: true,
    },
  });

  if (!fabric) {
    notFound();
  }

  // Check if buyer has previously ordered/received a sample
  let previouslySampled = false;
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.role === "BUYER" && currentUser.buyerProfile) {
    const pastSample = await db.sampleOrder.findFirst({
      where: {
        buyerId: currentUser.buyerProfile.id,
        fabricId: fabric.id,
        status: { in: ["DELIVERED", "COMPLETED"] },
      },
    });
    if (pastSample) {
      previouslySampled = true;
    }
  }

  // Fetch related fabrics (same category, excluding current)
  const relatedFabrics = await db.fabric.findMany({
    where: {
      categoryId: fabric.categoryId,
      id: { not: fabric.id },
      status: "PUBLISHED",
    },
    include: {
      images: { take: 1 },
      supplier: true,
    },
    take: 4,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full font-sans">
      {/* Breadcrumb */}
      <div className="text-xs font-semibold text-slate-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-slate-600">Home</Link>
        <span>/</span>
        <Link href="/fabrics" className="hover:text-slate-600">Fabrics</Link>
        <span>/</span>
        <span className="text-slate-600">{fabric.name}</span>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Gallery Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden aspect-[4/3] relative">
            {fabric.images[0] ? (
              <img
                src={fabric.images[0].url}
                alt={fabric.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                No Image Available
              </div>
            )}
            
            {previouslySampled && (
              <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Sampled ✓
              </span>
            )}
          </div>

          {/* Grid of thumbnails if multiple images */}
          {fabric.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {fabric.images.map((img) => (
                <div key={img.id} className="bg-white border border-slate-200 rounded overflow-hidden aspect-[4/3]">
                  <img src={img.url} alt={fabric.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded">
                  {fabric.category.name}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Fabric ID: {fabric.fabricId}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {fabric.name}
              </h1>
            </div>

            {/* Price & MOQ Highlights */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-lg p-4">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Approx Price</span>
                <span className="text-xl font-extrabold text-slate-900">₹{fabric.price.toString()}/m</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">MOQ (Bulk)</span>
                <span className="text-xl font-extrabold text-slate-900">{fabric.moq.toLocaleString()} m</span>
              </div>
            </div>

            {/* Supplier Meta */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Supplier</span>
                <span className="font-bold text-slate-900">{fabric.supplier.businessName}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {fabric.supplier.location}
                </span>
                {fabric.supplier.status === "VERIFIED" && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                    <ShieldCheck className="h-3 w-3" /> Verified Mill
                  </span>
                )}
              </div>
            </div>

            {/* Sample Callout */}
            {fabric.sampleAvailable && fabric.sampleOptions.length > 0 && (
              <div className="border border-[#e6e0d5] bg-[#faf8f5] rounded-xl p-4 text-xs space-y-2">
                <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">
                  Not sure yet?
                </span>
                <p className="text-slate-600 font-semibold leading-relaxed">
                  Feel it before you buy in bulk. Test draping, colorfastness, and hand-feel.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {fabric.sampleOptions.map((opt) => (
                    <span key={opt.id} className="inline-block bg-white border border-slate-200 px-2.5 py-1 rounded text-[10px] font-bold text-slate-700">
                      {opt.name} · ₹{parseFloat(opt.price.toString()).toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col gap-3">
              {fabric.sampleAvailable && fabric.sampleOptions.length > 0 ? (
                <Link
                  href={`/checkout/sample?fabricId=${fabric.id}`}
                  className="w-full text-center py-3.5 text-xs font-bold uppercase tracking-wider rounded-md bg-white border border-slate-900 text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  ORDER PHYSICAL SAMPLE
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full text-center py-3.5 text-xs font-bold uppercase tracking-wider rounded-md bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                >
                  SAMPLE NOT AVAILABLE
                </button>
              )}

              <Link
                href={`/buyer/quotes/new?fabricId=${fabric.id}`}
                className="w-full text-center py-3.5 text-xs font-bold uppercase tracking-wider rounded-md bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-lg shadow-slate-900/10 flex items-center justify-center gap-1.5"
              >
                <SendHorizontal className="h-4 w-4" /> REQUEST BULK QUOTE
              </Link>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {fabric.description}
            </p>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <section className="mt-12 bg-white border border-slate-200 rounded-lg p-6 md:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-4 mb-6">
          Technical Specifications
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          {[
            { label: "Material", value: fabric.material },
            { label: "Composition", value: fabric.composition },
            { label: "GSM Weight", value: `${fabric.gsm} gsm` },
            { label: "Width", value: `${fabric.width} inches` },
            { label: "Stretch Factor", value: fabric.stretch },
            { label: "Surface Finish", value: fabric.finish },
            { label: "Pattern type", value: fabric.pattern },
            { label: "Production Lead Time", value: `${fabric.productionTime} days` },
            { label: "Colors Available", value: fabric.colors.join(", ") },
            { label: "Applications / Use Cases", value: fabric.useCases.join(", ") },
          ].map((spec, idx) => (
            <div key={idx} className="border-b border-slate-100 pb-3">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{spec.label}</span>
              <span className="font-semibold text-slate-900">{spec.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Related Fabrics */}
      {relatedFabrics.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-8">Related Fabrics from Surat</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedFabrics.map((rel) => (
              <div key={rel.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <Link href={`/fabrics/${rel.slug}`} className="block">
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                    {rel.images[0] ? (
                      <img src={rel.images[0].url} alt={rel.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">{rel.name}</h3>
                    <div className="mt-2 flex justify-between items-center text-xs font-extrabold text-slate-950">
                      <span>₹{rel.price.toString()}/m</span>
                      <span className="text-slate-400 font-medium">MOQ: {rel.moq}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
