"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpDown,
  RotateCcw,
  Leaf,
  Store,
  Sparkles,
  AlertCircle,
  Package,
  Check,
  ShoppingCart,
  ChevronDown,
  ListFilter,
  CheckCircle2,
  Loader2,
  ArrowUp,
  LayoutGrid,
  LayoutList,
  SlidersHorizontal,
  X,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import ProductCard, { getCategoryIcon } from "@/components/products/ProductCard";
import PublicProductDetailModal from "@/components/products/PublicProductDetailModal";

const PAGE_SIZE = 9;

export default function PublicProductsPage() {
  const { fetchPublicProducts, fetchPublicCategories } = useProductStore();
  const { toastItem, clearToast } = useCartStore();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Pagination & infinite scroll states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Layout view mode: 'grid' | 'list'
  const [viewMode, setViewMode] = useState("grid");

  // Mobile filters drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'price_asc' | 'price_desc' | 'name_asc'
  const [inStockOnly, setInStockOnly] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [priceRange, setPriceRange] = useState("all"); // 'all' | 'under_1000' | '1000_3000' | 'above_3000'

  // Modal and toast states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Refs for infinite scroll observer
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  // Dismiss cart toast after 3 seconds
  useEffect(() => {
    if (toastItem) {
      const timer = setTimeout(() => {
        clearToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastItem, clearToast]);

  // Load categories once
  useEffect(() => {
    let isCancelled = false;
    async function loadCats() {
      try {
        const catRes = await fetchPublicCategories();
        if (!isCancelled && catRes?.success && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }
      } catch {
        // ignore
      }
    }
    loadCats();
    return () => {
      isCancelled = true;
    };
  }, [fetchPublicCategories]);

  // Build query params
  const getParams = useCallback(
    (targetPage) => {
      const params = {
        page: targetPage,
        page_size: PAGE_SIZE,
      };
      if (sortBy) params.sort = sortBy;
      if (inStockOnly) params.in_stock = "true";
      if (organicOnly) params.is_organic = "true";
      if (selectedCategory && selectedCategory !== "all") {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // Price filter handling
      if (priceRange === "under_1000") {
        params.max_price = 1000;
      } else if (priceRange === "1000_3000") {
        params.min_price = 1000;
        params.max_price = 3000;
      } else if (priceRange === "above_3000") {
        params.min_price = 3000;
      }

      return params;
    },
    [sortBy, inStockOnly, organicOnly, selectedCategory, searchQuery, priceRange]
  );

  // 1. Initial / Filter change load (resets list to page 1)
  useEffect(() => {
    let isCancelled = false;

    async function fetchFirstPage() {
      setLoadingInitial(true);
      setErrorMsg(null);
      try {
        const params = getParams(1);
        const res = await fetchPublicProducts(params);

        if (!isCancelled) {
          if (res?.success) {
            const items = res.data || [];
            const count = res.count ?? items.length;
            setProducts(items);
            setTotalCount(count);
            setPage(1);
            setHasMore(items.length < count && items.length >= PAGE_SIZE);
            setErrorMsg(null);
          } else {
            setErrorMsg(res?.error || "Failed to load products");
          }
          setLoadingInitial(false);
        }
      } catch {
        if (!isCancelled) {
          setErrorMsg("An unexpected error occurred while loading products.");
          setLoadingInitial(false);
        }
      }
    }

    fetchFirstPage();

    return () => {
      isCancelled = true;
    };
  }, [fetchPublicProducts, getParams, refreshTrigger]);

  // 2. Load next page (appends to products list on scroll)
  const loadNextPage = useCallback(async () => {
    if (loadingInitial || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const params = getParams(nextPage);
      const res = await fetchPublicProducts(params);

      if (res?.success) {
        const newItems = res.data || [];
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const filteredNew = newItems.filter((p) => !existingIds.has(p.id));
          const updated = [...prev, ...filteredNew];

          const total = res.count ?? updated.length;
          setTotalCount(total);
          setHasMore(updated.length < total && newItems.length > 0);
          return updated;
        });
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingInitial, loadingMore, hasMore, page, getParams, fetchPublicProducts]);

  // 3. Intersection Observer for infinite scrolling
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingInitial) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loadingMore && hasMore) {
          loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: "350px", // pre-fetch 350px before reaching the end
        threshold: 0.1,
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingInitial, loadingMore, loadNextPage]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");
    setInStockOnly(false);
    setOrganicOnly(false);
    setPriceRange("all");
  };

  const handleRetry = () => {
    setLoadingInitial(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== "all" ||
    sortBy !== "newest" ||
    inStockOnly ||
    organicOnly ||
    priceRange !== "all";

  const activeCatObj = categories.find((c) => String(c.slug || c.id) === String(selectedCategory));

  // Sidebar Filter Component (reused on desktop sidebar and mobile drawer)
  const FilterSidebarContent = (
    <div className="space-y-6">
      {/* Categories Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-fern" />
            Categories
          </h3>
          {selectedCategory !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="text-[11px] font-semibold text-fern hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        <div className="space-y-1">
          {/* All categories option */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setMobileFiltersOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-canopy text-husk shadow-sm font-bold"
                : "text-zinc-700 hover:bg-zinc-100/80"
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🌾</span>
              <span>All Products</span>
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full ${
                selectedCategory === "all" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {totalCount}
            </span>
          </button>

          {/* Dynamic categories */}
          {categories.map((cat) => {
            const val = String(cat.slug || cat.id);
            const isSelected = String(selectedCategory) === val;
            const icon = getCategoryIcon(cat.name);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(val);
                  setMobileFiltersOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-canopy text-husk shadow-sm font-bold"
                    : "text-zinc-700 hover:bg-zinc-100/80"
                }`}
              >
                <span className="flex items-center gap-2 truncate pr-2">
                  <span>{icon}</span>
                  <span className="truncate">{cat.name}</span>
                </span>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 stroke-[3] text-husk shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-zinc-200/80" />

      {/* Product Attributes (Availability & Organic) */}
      <div className="space-y-3">
        <h3 className="font-display text-sm font-bold text-zinc-900 uppercase tracking-wider">
          Product Type
        </h3>

        {/* In Stock Only */}
        <label className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-50 cursor-pointer border border-transparent hover:border-zinc-200 transition-colors">
          <span className="text-xs font-semibold text-zinc-800 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            In Stock Only
          </span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 rounded text-canopy focus:ring-canopy cursor-pointer"
          />
        </label>

        {/* 100% Organic */}
        <label className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-50 cursor-pointer border border-transparent hover:border-zinc-200 transition-colors">
          <span className="text-xs font-semibold text-zinc-800 flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5 text-fern" />
            100% Organic Certified
          </span>
          <input
            type="checkbox"
            checked={organicOnly}
            onChange={(e) => setOrganicOnly(e.target.checked)}
            className="h-4 w-4 rounded text-canopy focus:ring-canopy cursor-pointer"
          />
        </label>
      </div>

      <div className="border-t border-zinc-200/80" />

      {/* Price Range */}
      <div>
        <h3 className="font-display text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">
          Price Range
        </h3>
        <div className="space-y-1.5">
          {[
            { id: "all", label: "All Prices" },
            { id: "under_1000", label: "Under PKR 1,000" },
            { id: "1000_3000", label: "PKR 1,000 — 3,000" },
            { id: "above_3000", label: "Above PKR 3,000" },
          ].map((item) => (
            <label
              key={item.id}
              onClick={() => setPriceRange(item.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                priceRange === item.id
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <span>{item.label}</span>
              <div
                className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${
                  priceRange === item.id ? "border-fern bg-fern" : "border-zinc-300"
                }`}
              >
                {priceRange === item.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Action */}
      {hasActiveFilters && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleClearFilters}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear All Filters
          </button>
        </div>
      )}

      {/* Disease Diagnosis Helper Card */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-mist/30 to-husk p-4 border border-emerald-200/70 text-xs shadow-2xs">
        <div className="flex items-center gap-2 font-display font-bold text-canopy mb-1">
          <Sparkles className="h-4 w-4 text-fern" />
          <span>LeafLens AI Doctor</span>
        </div>
        <p className="text-[11px] text-soil/80 leading-relaxed mb-3">
          Not sure what medicine your crop needs? Scan a leaf photo for instant AI diagnosis.
        </p>
        <Link href="/detect" className="block">
          <Button size="sm" className="w-full bg-canopy text-husk hover:bg-canopy/90 rounded-xl text-xs font-bold">
            Scan Crop Leaf
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-husk/30 pb-24 text-canopy">
      {/* Floating Added-to-Cart Toast */}
      {toastItem && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-canopy text-husk px-4 py-3 shadow-2xl border border-fern/30 animate-in slide-in-from-bottom duration-300">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-fern text-husk">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold">Added to Cart!</p>
            <p className="text-husk/80 line-clamp-1 max-w-[200px]">{toastItem.name}</p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MAIN TWO-COLUMN CONTAINER
          ───────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── LEFT COLUMN: STICKY FILTERS SIDEBAR (DESKTOP) ── */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-20 bg-white p-5 rounded-3xl border border-zinc-200/90 shadow-2xs">
            {FilterSidebarContent}
          </aside>

          {/* ── RIGHT COLUMN: MAIN PRODUCT FEED ── */}
          <main className="lg:col-span-9 space-y-5">
            {/* Top Toolbar: Search, Sort, View Modes */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-3xl border border-zinc-200/90 shadow-2xs">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by title, active ingredient, brand..."
                  className="w-full h-10 pl-10 pr-9 rounded-2xl border border-zinc-200/90 bg-zinc-50/50 text-xs sm:text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-fern/30 focus:border-fern transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 text-xs hover:bg-zinc-300 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Right controls: Mobile filter trigger, Sort & View Mode switch */}
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Mobile Filters Drawer Trigger */}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 h-10 px-3.5 rounded-2xl border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-fern" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="h-2 w-2 rounded-full bg-fern" />
                  )}
                </button>

                {/* Sort selector */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-10 pl-3 pr-8 rounded-2xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-fern/30 focus:border-fern transition-all cursor-pointer appearance-none"
                  >
                    <option value="newest">Sort: Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                </div>

                {/* View Switcher: Grid vs List */}
                <div className="flex items-center bg-zinc-100 p-1 rounded-2xl border border-zinc-200/80">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-white text-canopy shadow-2xs font-bold"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all cursor-pointer ${
                      viewMode === "list"
                        ? "bg-white text-canopy shadow-2xs font-bold"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                    title="List View"
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Pill Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-soil/75">
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  Showing <strong className="text-canopy font-bold">{products.length}</strong> of{" "}
                  <strong className="text-canopy font-bold">{totalCount}</strong> products
                </span>

                {selectedCategory !== "all" && activeCatObj && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    Category: {activeCatObj.name}
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className="ml-1 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    In Stock Only
                    <button
                      type="button"
                      onClick={() => setInStockOnly(false)}
                      className="ml-1 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                )}

                {organicOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-xs font-semibold">
                    100% Organic
                    <button
                      type="button"
                      onClick={() => setOrganicOnly(false)}
                      className="ml-1 hover:text-rose-200"
                    >
                      ×
                    </button>
                  </span>
                )}

                {priceRange !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold">
                    Price: {priceRange.replace("_", " ")}
                    <button
                      type="button"
                      onClick={() => setPriceRange("all")}
                      className="ml-1 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="font-bold text-fern hover:text-canopy hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* ── PRODUCTS FEED ── */}
            {/* Loading Initial Skeletons */}
            {loadingInitial && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl border border-zinc-200/70 p-4 space-y-4 animate-pulse shadow-xs"
                  >
                    <div className="aspect-[4/3] rounded-2xl bg-zinc-200" />
                    <div className="space-y-2">
                      <div className="h-3 w-1/3 bg-zinc-200 rounded" />
                      <div className="h-4.5 w-4/5 bg-zinc-200 rounded" />
                      <div className="h-3 w-1/2 bg-zinc-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {!loadingInitial && errorMsg && (
              <div className="rounded-3xl bg-rose-50 border border-rose-200 p-8 text-center max-w-lg mx-auto shadow-sm">
                <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-rose-900">Unable to load catalog</h3>
                <p className="mt-1 text-xs text-rose-700">{errorMsg}</p>
                <Button
                  onClick={handleRetry}
                  size="sm"
                  className="mt-4 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-xs font-semibold"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!loadingInitial && !errorMsg && products.length === 0 && (
              <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center max-w-lg mx-auto shadow-2xs">
                <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-3xl bg-mist/50 text-fern mb-4">
                  <Package className="h-9 w-9 stroke-[1.5]" />
                </div>
                <h3 className="font-display text-xl font-bold text-canopy">No products found</h3>
                <p className="mt-2 text-xs text-soil/75 leading-relaxed">
                  We couldn&apos;t find any verified products matching your selected filters. Try adjusting your search or category.
                </p>
                {hasActiveFilters && (
                  <Button
                    onClick={handleClearFilters}
                    size="sm"
                    className="mt-5 bg-canopy text-husk hover:bg-canopy/90 rounded-xl text-xs font-bold"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            )}

            {/* Products Grid / List */}
            {!loadingInitial && !errorMsg && products.length > 0 && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id || product.slug}
                    product={product}
                    viewMode={viewMode}
                    onViewDetails={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}

            {/* Infinite Scroll Sentinel & Bottom Loading Indicator */}
            <div ref={sentinelRef} className="pt-6 pb-12 flex flex-col items-center justify-center">
              {loadingMore && (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2.5 rounded-full bg-white px-5 py-2.5 shadow-sm border border-canopy/15 text-xs font-bold text-canopy">
                    <Loader2 className="h-4 w-4 animate-spin text-fern" />
                    <span>Loading more products...</span>
                  </div>
                </div>
              )}

              {/* Fallback load more button */}
              {!loadingMore && hasMore && products.length > 0 && (
                <button
                  type="button"
                  onClick={loadNextPage}
                  className="rounded-2xl border border-canopy/20 bg-white px-6 py-2.5 text-xs font-bold text-canopy shadow-xs hover:bg-emerald-50/50 hover:border-fern transition-all cursor-pointer"
                >
                  Load More Products ↓
                </button>
              )}

              {/* End of results indicator */}
              {!hasMore && products.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full rounded-2xl bg-white/70 p-4 border border-canopy/10 shadow-2xs text-xs text-soil/80">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <span>
                      All <strong className="text-canopy font-bold">{products.length}</strong> products loaded
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={scrollToTop}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 font-bold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <ArrowUp className="h-3.5 w-3.5 text-fern" />
                    <span>Back to top</span>
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ── MOBILE FILTERS SLIDE-OVER DRAWER ── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xs flex-col bg-white p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-left">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
              <h2 className="font-display text-base font-bold text-canopy">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {FilterSidebarContent}
          </div>
        </div>
      )}

      {/* Public Product Details Dialog */}
      <PublicProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
