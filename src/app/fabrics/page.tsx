import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Search, Filter, ShieldCheck, Grid, List, SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface FabricsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    supplier?: string;
    minPrice?: string;
    maxPrice?: string;
    gsm?: string;
    width?: string;
    moq?: string;
    composition?: string;
    useCase?: string;
    supplierType?: string;
    location?: string;
    sort?: string;
  }>;
}

export default async function FabricsPage({ searchParams }: FabricsPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const categorySlug = params.category || "";
  const supplierId = params.supplier || "";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const gsm = params.gsm ? parseInt(params.gsm) : undefined;
  const width = params.width ? parseInt(params.width) : undefined;
  const moq = params.moq ? parseInt(params.moq) : undefined;
  const composition = params.composition || "";
  const useCase = params.useCase || "";
  const supplierType = params.supplierType || "";
  const location = params.location || "";
  const sort = params.sort || "recommended";

  // Build prisma where query
  const where: any = {
    status: "PUBLISHED",
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { fabricId: { contains: search, mode: "insensitive" } },
      { composition: { contains: search, mode: "insensitive" } },
      { material: { contains: search, mode: "insensitive" } },
      { supplier: { businessName: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (supplierId) {
    where.supplierId = supplierId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (gsm !== undefined) {
    where.gsm = { gte: gsm - 20, lte: gsm + 20 }; // show fabrics close to target GSM
  }

  if (width !== undefined) {
    where.width = { gte: width };
  }

  if (moq !== undefined) {
    where.moq = { lte: moq }; // show fabrics with MOQ less than or equal to buyer capability
  }

  if (composition) {
    where.composition = { contains: composition, mode: "insensitive" };
  }

  if (useCase) {
    where.useCases = { has: useCase };
  }

  if (supplierType) {
    where.supplier = { ...where.supplier, supplierType: supplierType as any };
  }

  if (location) {
    where.supplier = { ...where.supplier, location: { contains: location, mode: "insensitive" } };
  }

  // Sorting
  let orderBy: any = { createdAt: "desc" }; // default
  if (sort === "price-asc") {
    orderBy = { price: "asc" };
  } else if (sort === "price-desc") {
    orderBy = { price: "desc" };
  } else if (sort === "moq-asc") {
    orderBy = { moq: "asc" };
  } else if (sort === "gsm-desc") {
    orderBy = { gsm: "desc" };
  }

  // Fetch data
  const fabrics = await db.fabric.findMany({
    where,
    orderBy,
    include: {
      supplier: true,
      category: true,
      images: { take: 1 },
    },
  });

  const categories = await db.category.findMany();
  
  // Static lists for filter dropdowns
  const locations = ["Surat", "Mumbai", "Ahmedabad", "Delhi", "Bangalore"];
  const useCases = ["Digital printing", "Screen printing", "Garments", "Dresses", "Kurtis", "Sarees", "Shirts", "Home textile"];
  const supplierTypes = [
    { value: "MANUFACTURER", label: "Manufacturer" },
    { value: "TRADER", label: "Trader" },
    { value: "WHOLESALER", label: "Wholesaler" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow flex flex-col font-sans">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Discover Fabrics</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Showing {fabrics.length} premium Surat fabrics ready for sourcing.
          </p>
        </div>

        {/* Search Bar */}
        <form action="/fabrics" method="GET" className="flex items-center w-full md:max-w-md bg-white border border-slate-300 rounded-md overflow-hidden shadow-sm">
          <div className="pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search name, GSM, composition, mill..."
            className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none placeholder-slate-400 font-medium"
          />
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          {sort && <input type="hidden" name="sort" value={sort} />}
          <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 transition-colors">
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start flex-grow">
        {/* Left Filter Sidebar */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm sticky top-20 lg:block">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-500" /> Filters
            </h2>
            <Link href="/fabrics" className="text-xs font-semibold text-blue-600 hover:text-blue-500">
              Clear All
            </Link>
          </div>

          <form action="/fabrics" method="GET" className="space-y-6">
            {search && <input type="hidden" name="search" value={search} />}
            {sort && <input type="hidden" name="sort" value={sort} />}

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
              <select
                id="category"
                name="category"
                defaultValue={categorySlug}
                className="w-full text-sm border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Price Per Metre (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  defaultValue={params.minPrice || ""}
                  className="w-full text-sm border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  defaultValue={params.maxPrice || ""}
                  className="w-full text-sm border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* GSM Filter */}
            <div>
              <label htmlFor="gsm" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target GSM</label>
              <input
                id="gsm"
                type="number"
                name="gsm"
                placeholder="e.g. 120"
                defaultValue={params.gsm || ""}
                className="w-full text-sm border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Width Filter */}
            <div>
              <label htmlFor="width" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Min Width (inches)</label>
              <input
                id="width"
                type="number"
                name="width"
                placeholder="e.g. 44"
                defaultValue={params.width || ""}
                className="w-full text-sm border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* MOQ Filter */}
            <div>
              <label htmlFor="moq" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Max MOQ Needed</label>
              <input
                id="moq"
                type="number"
                name="moq"
                placeholder="e.g. 1000"
                defaultValue={params.moq || ""}
                className="w-full text-sm border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Use Case Filter */}
            <div>
              <label htmlFor="useCase" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Use Case / Application</label>
              <select
                id="useCase"
                name="useCase"
                defaultValue={useCase}
                className="w-full text-sm border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="">All Applications</option>
                {useCases.map((uc) => (
                  <option key={uc} value={uc}>
                    {uc}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier Type Filter */}
            <div>
              <label htmlFor="supplierType" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Supplier Type</label>
              <select
                id="supplierType"
                name="supplierType"
                defaultValue={supplierType}
                className="w-full text-sm border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="">All Types</option>
                {supplierTypes.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label htmlFor="location" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Supplier Location</label>
              <select
                id="location"
                name="location"
                defaultValue={location}
                className="w-full text-sm border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-2 rounded transition-colors"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Right Fabric Listings Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting and Grid controls */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {fabrics.length} Items Found
            </span>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" /> Sort By
              </span>
              <form action="/fabrics" method="GET" className="inline-block">
                {search && <input type="hidden" name="search" value={search} />}
                {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                {params.minPrice && <input type="hidden" name="minPrice" value={params.minPrice} />}
                {params.maxPrice && <input type="hidden" name="maxPrice" value={params.maxPrice} />}
                {params.gsm && <input type="hidden" name="gsm" value={params.gsm} />}
                {params.width && <input type="hidden" name="width" value={params.width} />}
                {params.moq && <input type="hidden" name="moq" value={params.moq} />}
                {useCase && <input type="hidden" name="useCase" value={useCase} />}
                {supplierType && <input type="hidden" name="supplierType" value={supplierType} />}
                {location && <input type="hidden" name="location" value={location} />}

                <select
                  name="sort"
                  defaultValue={sort}
                  onChange={(e) => e.target.form?.submit()}
                  className="text-xs border border-slate-300 rounded px-2 py-1.5 text-slate-900 bg-white font-semibold focus:outline-none"
                >
                  <option value="recommended">Newest Listings</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="moq-asc">MOQ: Low to High</option>
                  <option value="gsm-desc">GSM: High to Low</option>
                </select>
              </form>
            </div>
          </div>

          {fabrics.length === 0 ? (
            <div className="text-center bg-white border border-slate-200 rounded-lg p-16 space-y-4">
              <SlidersHorizontal className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Fabrics Match Your Filters</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Try widening your price range, clearing your search, or changing selected categories.
              </p>
              <Link href="/fabrics" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500">
                Reset All Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {fabrics.map((fabric) => (
                <div
                  key={fabric.id}
                  className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg"
                >
                  <div>
                    {/* Image */}
                    <div className="relative bg-slate-100 aspect-[4/3] overflow-hidden border-b border-slate-100">
                      {fabric.images[0] ? (
                        <img
                          src={fabric.images[0].url}
                          alt={fabric.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          No Image
                        </div>
                      )}
                      <span className="absolute top-2 left-2 bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                        {fabric.category.name}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1">
                        <span>ID: {fabric.fabricId}</span>
                        <span>•</span>
                        <span>GSM: {fabric.gsm}</span>
                      </div>

                      <Link href={`/fabrics/${fabric.slug}`} className="block">
                        <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                          {fabric.name}
                        </h3>
                      </Link>

                      {/* Specs */}
                      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-b border-slate-100 py-2.5 text-xs">
                        <div>
                          <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Approx Price</span>
                          <span className="font-extrabold text-slate-950">₹{fabric.price.toString()}/m</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">MOQ</span>
                          <span className="font-extrabold text-slate-950">{fabric.moq.toLocaleString()} m</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <span className="text-slate-400">Supplier:</span>{" "}
                          <span className="font-semibold text-slate-800 truncate">{fabric.supplier.businessName}</span>
                        </div>
                        {fabric.supplier.status === "VERIFIED" && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            <ShieldCheck className="h-2.5 w-2.5" /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      href={`/fabrics/${fabric.slug}`}
                      className="block w-full text-center py-2 text-xs font-semibold rounded-md border border-slate-900 text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      Get Sample & Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
