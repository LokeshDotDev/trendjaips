"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, ChevronRight, Package, ArrowRight, Truck, MessageSquare, BadgeCheck, Compass } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomepageClientProps {
  fabrics: any[];
  suppliers: any[];
  categories: any[];
}

export default function HomepageClient({ fabrics, suppliers, categories }: HomepageClientProps) {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Hero Entrance Animations
    const ctx = gsap.context(() => {
      // Headline reveal
      gsap.fromTo(
        ".char-reveal",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power4.out", stagger: 0.1, delay: 0.2 }
      );

      // Subtitle & CTAs fade
      gsap.fromTo(
        ".fade-in-element",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.2, delay: 0.8 }
      );

      // Horizontal Category Scroll or parallax scroll
      gsap.fromTo(
        ".reveal-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          scrollTrigger: {
            trigger: ".reveal-card-trigger",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Workflow line animations
      gsap.fromTo(
        ".step-bubble",
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".workflow-section",
            start: "top 75%",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    startTransition(() => {
      router.push(`/fabrics?search=${encodeURIComponent(searchText.trim())}`);
    });
  };

  return (
    <div className="flex flex-col textile-grain bg-[#faf8f5]">
      
      {/* 1. Cinematic Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex flex-col justify-center items-center py-24 px-4 sm:px-6 lg:px-8 border-b border-[#f2ece2] textile-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#faf8f5]/50 pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#b39b7d]/10 border border-[#b39b7d]/20 text-[#8c7457] uppercase tracking-widest fade-in-element">
            <BadgeCheck className="h-4 w-4" /> Direct Surat Manufacturer Sourcing
          </span>
          
          <h1 ref={headlineRef} className="editorial-headline text-slate-900 tracking-tight font-black leading-none">
            <span className="block overflow-hidden py-1">
              <span className="inline-block char-reveal">THE FABRIC</span>
            </span>
            <span className="block overflow-hidden py-1">
              <span className="inline-block char-reveal text-[#8c7457] italic font-serif">BEHIND YOUR</span>
            </span>
            <span className="block overflow-hidden py-1">
              <span className="inline-block char-reveal">NEXT CREATION.</span>
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-medium leading-relaxed fade-in-element">
            Discover fabrics directly from Surat's textile ecosystem. Order physical samples, verify material metrics, negotiate pricing directly with mills, and purchase in bulk.
          </p>

          {/* Search bar */}
          <form ref={searchRef} onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative mt-8 fade-in-element">
            <div className="flex items-center bg-white rounded-full shadow-md overflow-hidden border border-[#e6e0d5] focus-within:border-[#b39b7d] focus-within:ring-2 focus-within:ring-[#b39b7d]/10 transition-all p-1.5">
              <div className="pl-4 text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search Korean BSY, 120 GSM Cotton, Rayon prints..."
                className="w-full px-4 py-3 text-slate-900 text-sm focus:outline-none placeholder-slate-400 font-medium bg-transparent"
              />
              <button
                type="submit"
                className="bg-[#1e1e1f] hover:bg-[#b39b7d] text-white font-bold text-xs uppercase tracking-wider px-7 py-3.5 rounded-full transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 fade-in-element">
            <Link
              href="/fabrics"
              className="w-full sm:w-auto px-8 py-4 text-xs font-bold uppercase tracking-wider rounded-full bg-[#1e1e1f] hover:bg-[#b39b7d] text-[#faf8f5] transition-colors shadow-sm"
            >
              Explore Fabrics
            </Link>
            <Link
              href="/auth/register?role=SUPPLIER"
              className="w-full sm:w-auto px-8 py-4 text-xs font-bold uppercase tracking-wider rounded-full bg-transparent border border-slate-300 text-slate-700 hover:border-[#1e1e1f] hover:text-slate-900 transition-colors"
            >
              Become a Supplier
            </Link>
          </div>
        </div>
      </section>

      {/* 2. "Choose Your World" Category Panels */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#f2ece2] max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Choose Your Fabric World</h2>
          <p className="text-sm text-slate-500 font-medium">Immerse yourself into Surat's core sourcing categories.</p>
        </div>

        {/* Categories horizontal panels */}
        <div ref={categoriesRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[450px]">
          {categories.map((cat) => {
            const isHovered = hoveredCategory === cat.id;
            return (
              <div
                key={cat.id}
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`relative rounded-2xl overflow-hidden border border-[#f0eae1] transition-all duration-700 bg-white flex flex-col justify-between p-8 group ${
                  hoveredCategory === cat.id ? "lg:flex-[1.5]" : "lg:flex-1"
                }`}
                style={{
                  height: "100%",
                }}
              >
                {/* Background image fade */}
                <div
                  className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity duration-700 bg-cover bg-center"
                  style={{ backgroundImage: `url(${cat.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'})` }}
                ></div>

                <div className="relative z-10 space-y-2">
                  <span className="text-[10px] font-bold text-[#b39b7d] tracking-widest uppercase">
                    Category Group
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#8c7457] transition-colors font-serif">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs pt-2">
                    {cat.description || "Browse premium textile catalog lists sourced directly from Surat's weaving units."}
                  </p>
                </div>

                {/* Subcategories list */}
                <div className="relative z-10 pt-8 border-t border-[#f2ece2]/50 mt-6 lg:mt-0">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Subcategories
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {cat.subcategories?.slice(0, 5).map((sub: any) => (
                      <Link
                        key={sub.id}
                        href={`/fabrics?category=${sub.slug}`}
                        className="text-xs font-semibold text-slate-700 bg-[#faf8f5] hover:bg-[#b39b7d]/10 hover:text-[#8c7457] px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 pt-6 flex justify-end">
                  <Link
                    href={`/fabrics?category=${cat.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 group-hover:text-[#8c7457] transition-colors"
                  >
                    View All <ArrowRight className="h-4.5 w-4.5 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Immersive Fabric Discovery (Showcase Cards) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full reveal-card-trigger">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Curated Loom Arrivals</h2>
            <p className="text-sm text-slate-500 font-medium">Authentic fabric rolls with full physical parameters detailed.</p>
          </div>
          <Link href="/fabrics" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#8c7457] hover:text-slate-900 transition-colors">
            Browse Sourcing Studio <ChevronRight className="h-4.5 w-4.5 ml-1" />
          </Link>
        </div>

        {fabrics.length === 0 ? (
          <div className="text-center bg-white border border-[#f0eae1] rounded-2xl p-16">
            <p className="text-slate-400 font-medium">No fabrics published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fabrics.map((fabric) => (
              <div
                key={fabric.id}
                className="premium-card rounded-2xl overflow-hidden flex flex-col justify-between reveal-card"
              >
                <div>
                  {/* Fabric Image */}
                  <div className="relative bg-slate-100 aspect-[4/3] overflow-hidden border-b border-[#f2ece2] reveal-img-wrapper">
                    {fabric.images[0] ? (
                      <img
                        src={fabric.images[0].url}
                        alt={fabric.name}
                        className="w-full h-full object-cover reveal-img"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No Image Available
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-slate-900/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      {fabric.category.name}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <span>ID: {fabric.fabricId}</span>
                      <span>•</span>
                      <span>{fabric.gsm} GSM</span>
                      <span>•</span>
                      <span>{fabric.width}" WIDTH</span>
                    </div>

                    <Link href={`/fabrics/${fabric.slug}`} className="block">
                      <h3 className="text-lg font-bold text-slate-900 hover:text-[#8c7457] transition-colors line-clamp-1 font-serif">
                        {fabric.name}
                      </h3>
                    </Link>

                    {/* Price and MOQ Info */}
                    <div className="grid grid-cols-2 gap-4 border-t border-b border-[#f2ece2] py-3.5">
                      <div>
                        <span className="block text-[9px] text-slate-400 uppercase font-black tracking-wider">Approx. Price</span>
                        <span className="text-base font-extrabold text-slate-900">
                          ₹{parseFloat(fabric.price.toString()).toFixed(2)}/m
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 uppercase font-black tracking-wider">MOQ</span>
                        <span className="text-base font-extrabold text-slate-900">
                          {fabric.moq.toLocaleString()} m
                        </span>
                      </div>
                    </div>

                    {/* Supplier info */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="truncate pr-2">
                        <span className="text-slate-400">Supplier:</span>{" "}
                        <span className="font-bold text-slate-800 truncate">{fabric.supplier.businessName}</span>
                      </div>
                      {fabric.supplier.status === "VERIFIED" && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/fabrics/${fabric.slug}`}
                    className="block w-full text-center py-3 text-xs font-bold uppercase tracking-wider rounded-md border border-slate-950 text-slate-900 hover:bg-slate-950 hover:text-white transition-all"
                  >
                    Get Sample & Specifications
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. "Sample before you commit" Storytelling Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#1e1e1f] text-[#faf8f5] overflow-hidden border-t border-b border-[#111112]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] font-bold text-[#b39b7d] tracking-widest uppercase">
              The B2B Differentiator
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-serif leading-tight">
              Sample the Texture. <br/>
              Verify the Quality. <br/>
              Order in Bulk.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
              Buying fabric for production is a high-risk commercial deal. We eliminate risks by centering our procurement around a sample-first design. Try a standard swatch, run print trials or test shrinkage before committing.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/fabrics"
                className="px-8 py-4 text-xs font-bold uppercase tracking-wider rounded-full bg-[#faf8f5] hover:bg-[#b39b7d] text-[#1e1e1f] transition-colors"
              >
                Start Discovery
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative border border-slate-800 bg-slate-900/50 p-8 rounded-2xl max-w-md w-full space-y-8">
              {[
                { title: "Swatch Feel", desc: "Select options (e.g. 20x20 cm hand-feel cards) to check texture." },
                { title: "Washing & Fit Tests", desc: "Receive sample and run heat/shrink tests or colorfast reviews." },
                { title: "Direct Negotiation", desc: "Open negotiation in chat, structure terms and agree price." },
                { title: "Bulk Contract Run", desc: "Submit UTR confirmation and place bulk order through the loom." }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-[#b39b7d]/10 border border-[#b39b7d]/30 text-[#b39b7d] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{step.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Direct B2B Workflow Path */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full workflow-section">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Structured Sourcing Workflow</h2>
          <p className="text-sm text-slate-500 font-medium">From loom discovery to final production inspection, fully managed.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
          {[
            { step: "01", title: "Discover", desc: "Browse detailed specifications of catalogued fabrics.", icon: Compass },
            { step: "02", title: "Order Sample", desc: "Order a physical swatch or cut to inspect handle.", icon: Package },
            { step: "03", title: "Run Testing", desc: "Execute lab dip check or physical stretch testing.", icon: ShieldCheck },
            { step: "04", title: "Open RFQ", desc: "Submit target volume, target price and lead times.", icon: ArrowRight },
            { step: "05", title: "Negotiate Offer", desc: "Lock down prices via formal structured offers.", icon: MessageSquare },
            { step: "06", title: "Loom Run", desc: "Secure bulk order shipment direct from Surat factories.", icon: Truck }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-[#f0eae1] rounded-2xl p-6 flex flex-col justify-between shadow-sm step-bubble">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#b39b7d]">{item.step}</span>
                  <item.icon className="h-5 w-5 text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Surat Supplier Showcase */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-[#f2ece2] bg-[#faf8f5] max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Verified Surat Suppliers</h2>
            <p className="text-sm text-slate-500 font-medium">Bypassing local middlemen, deal directly with Surat's biggest mills.</p>
          </div>
        </div>

        {suppliers.length === 0 ? (
          <div className="text-center bg-white border border-[#f0eae1] rounded-2xl p-12">
            <p className="text-slate-400 text-xs">No verified suppliers seeded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {suppliers.map((sup) => (
              <div key={sup.id} className="bg-white border border-[#f0eae1] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified Mill
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-serif leading-snug">{sup.businessName}</h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                    {sup.description || "Direct manufacturers of high-speed Korean BSY, Rayon, and premium Crepe fabrics."}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#f2ece2] text-xs space-y-1.5 font-medium text-slate-600">
                  <div>Type: <span className="font-bold text-slate-900">{sup.supplierType}</span></div>
                  <div>Location: <span className="font-bold text-slate-900">{sup.location}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
