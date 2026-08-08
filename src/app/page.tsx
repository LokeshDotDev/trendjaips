import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Search, ShieldCheck, CheckCircle2, ChevronRight, Package, ArrowRight, Truck, MessageSquare, BadgeCheck } from "lucide-react";

export default async function HomePage() {
  // Fetch published fabrics
  const fabrics = await db.fabric.findMany({
    where: { status: "PUBLISHED" },
    include: {
      supplier: true,
      category: true,
      images: { take: 1 },
    },
    take: 6,
  });

  // Fetch verified suppliers
  const suppliers = await db.supplierProfile.findMany({
    where: { status: "VERIFIED" },
    take: 4,
  });

  // Categories list
  const categories = await db.category.findMany({
    take: 12,
  });

  return (
    <div className="flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <BadgeCheck className="h-3.5 w-3.5" /> Direct Surat Manufacturer Sourcing
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Source Fabrics Directly <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400">
              From Surat
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 font-medium">
            Discover fabrics from verified manufacturers and traders. Order physical samples, test the quality, negotiate bulk pricing, and buy with confidence.
          </p>

          {/* Search bar form redirecting to /fabrics */}
          <form action="/fabrics" method="GET" className="max-w-2xl mx-auto relative mt-6">
            <div className="flex items-center bg-white rounded-lg shadow-lg overflow-hidden border border-slate-700">
              <div className="pl-4 text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="search"
                placeholder="Search fabrics, GSM, composition, supplier..."
                className="w-full px-4 py-4 text-slate-950 focus:outline-none placeholder-slate-400 font-medium"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-4 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              href="/fabrics"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-500/20"
            >
              Explore Fabrics
            </Link>
            <Link
              href="/auth/register?role=SUPPLIER"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold rounded-md bg-transparent border border-slate-700 text-slate-200 hover:text-white hover:border-slate-500 transition-colors"
            >
              Become a Supplier
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center md:text-left mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Browse by Category</h2>
            <p className="mt-2 text-slate-500 font-medium">Explore fabrics grouped by materials and weaving styles.</p>
          </div>
          <Link href="/fabrics" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500">
            View All Fabrics <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/fabrics?category=${cat.slug}`}
              className="bg-white hover:bg-slate-50 border border-slate-200 rounded-lg p-5 text-center transition-all hover:shadow-md group"
            >
              <span className="block text-base font-bold text-slate-800 group-hover:text-blue-600">
                {cat.name}
              </span>
              <span className="block text-xs text-slate-400 mt-1">Direct from Surat</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">The B2B Sourcing Flow</h2>
            <p className="mt-4 text-lg text-slate-300">
              Procure directly from manufacturer looms. Zero commission agents, 100% transparent negotiation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8">
            {[
              { step: "1", title: "Discover", desc: "Browse catalogued Surat fabrics with detailed specifications.", icon: Search },
              { step: "2", title: "Order Sample", desc: "Select options (e.g. 1m cut) to verify feel & texture.", icon: Package },
              { step: "3", title: "Test Fabric", desc: "Run shrink tests, colorfast checks, and print tests.", icon: CheckCircle2 },
              { step: "4", title: "Request Quote", desc: "Enter target quantity (MOQ) and target pricing.", icon: ArrowRight },
              { step: "5", title: "Negotiate", desc: "Get private structured offers. Close the deal in chat.", icon: MessageSquare },
              { step: "6", title: "Buy Bulk", desc: "Pay securely via UTR and track shipment to delivery.", icon: Truck },
            ].map((step, idx) => (
              <div key={idx} className="relative bg-slate-800/50 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Step {step.step}</span>
                    <step.icon className="h-5 w-5 text-slate-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured / Trending Fabrics */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center md:text-left mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Featured Fabrics</h2>
            <p className="mt-2 text-slate-500 font-medium">Top verified fabric listings ready for sample dispatch.</p>
          </div>
          <Link href="/fabrics" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500">
            Explore All Fabrics <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {fabrics.length === 0 ? (
          <div className="text-center bg-white border border-slate-200 rounded-lg p-12">
            <p className="text-slate-500">No fabrics published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {fabrics.map((fabric) => (
              <div
                key={fabric.id}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg"
              >
                <div>
                  {/* Fabric Image */}
                  <div className="relative bg-slate-100 aspect-[4/3] overflow-hidden border-b border-slate-100">
                    {fabric.images[0] ? (
                      <img
                        src={fabric.images[0].url}
                        alt={fabric.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No Image Available
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-slate-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded">
                      {fabric.category.name}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                      <span>ID: {fabric.fabricId}</span>
                      <span>•</span>
                      <span>GSM: {fabric.gsm}</span>
                    </div>

                    <Link href={`/fabrics/${fabric.slug}`} className="block">
                      <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                        {fabric.name}
                      </h3>
                    </Link>

                    {/* Price and MOQ Info */}
                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Approx. Price</span>
                        <span className="text-base font-extrabold text-slate-900">
                          ₹{fabric.price.toString()}/m
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">MOQ</span>
                        <span className="text-base font-extrabold text-slate-900">
                          {fabric.moq.toLocaleString()} m
                        </span>
                      </div>
                    </div>

                    {/* Supplier info */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-slate-400">Supplier:</span>{" "}
                        <span className="font-semibold text-slate-800">{fabric.supplier.businessName}</span>
                      </div>
                      {fabric.supplier.status === "VERIFIED" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/fabrics/${fabric.slug}`}
                    className="block w-full text-center py-2 text-sm font-semibold rounded-md border border-slate-900 text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    Get Sample & Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Verified Suppliers */}
      <section id="suppliers" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Verified Surat Suppliers</h2>
            <p className="mt-2 text-slate-500 font-medium">
              We vet every manufacturer's looms and credit profile before displaying their listings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {suppliers.map((sup) => (
              <div key={sup.id} className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                      <ShieldCheck className="h-3 w-3" /> Verified Mill
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase">{sup.supplierType}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{sup.businessName}</h3>
                  <p className="text-xs text-slate-400 font-medium mb-3">{sup.location}</p>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{sup.description}</p>
                </div>

                <div className="border-t border-slate-100 mt-6 pt-4">
                  <Link
                    href={`/fabrics?supplier=${sup.id}`}
                    className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-500"
                  >
                    View Loom Catalogue <ChevronRight className="h-3 w-3 ml-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
