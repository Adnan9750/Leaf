"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Building2,
  CheckCircle2,
  Eye,
  Filter,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  LayoutList,
  Leaf,
  Package,
  Pencil,
  Percent,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { useProductStore } from "@/store/productStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useVendorStore } from "@/store/vendorStore";
import AddProductDialog from "@/components/admin/products/AddProductDialog";
import EditProductDialog from "@/components/admin/products/EditProductDialog";
import DeleteProductDialog from "@/components/admin/products/DeleteProductDialog";
import ViewProductDetailsDialog from "@/components/admin/products/ViewProductDetailsDialog";

function fmtPrice(value) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return `PKR ${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function ProductsPage() {
  const user = useAuthStore((state) => state.user);

  // ── Hydration-safe: derive isSuperAdmin only after client mount ──
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isSuperAdmin = mounted
    ? Boolean(user?.is_superuser || user?.role === "admin" || user?.is_staff)
    : false;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [statusTab, setStatusTab] = useState("all"); // 'all' | 'published' | 'draft' | 'low_stock'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'price_asc' | 'price_desc' | 'stock_desc' | 'stock_asc' | 'name_asc'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [notice, setNotice] = useState("");

  const { products, fetchProducts, isLoading, error } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { vendors, fetchVendors } = useVendorStore();

  useEffect(() => {
    fetchProducts(false);
    fetchCategories("all", "", false);
    if (isSuperAdmin) {
      fetchVendors("approved", false);
    }
  }, [fetchProducts, fetchCategories, fetchVendors, isSuperAdmin]);

  // Filter and sort products
  const processedProducts = useMemo(() => {
    const list = products || [];
    const q = searchQuery.trim().toLowerCase();

    // 1. Filtering
    const filtered = list.filter((p) => {
      // Search Query
      if (q) {
        const hay = [
          p.name,
          p.sku,
          p.brand,
          p.category_name,
          p.category?.name,
          p.vendor_name,
          p.vendor?.company_name,
          p.active_ingredient,
          p.slug,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Status Tab
      if (statusTab === "published") {
        if (p.status !== "published" || p.is_active === false) return false;
      } else if (statusTab === "draft") {
        if (p.status !== "draft") return false;
      } else if (statusTab === "low_stock") {
        const isLow =
          p.is_low_stock ||
          p.is_out_of_stock ||
          (p.stock != null && Number(p.stock) <= (p.low_stock_threshold ?? 5));
        if (!isLow) return false;
      }

      // Category
      if (selectedCategory !== "all") {
        const catId = p.category_id ?? p.category?.id ?? p.category;
        if (String(catId) !== String(selectedCategory)) return false;
      }

      // Vendor (for superadmin)
      if (isSuperAdmin && selectedVendor !== "all") {
        const venId = p.vendor_id ?? p.vendor?.id ?? p.vendor;
        if (String(venId) !== String(selectedVendor)) return false;
      }

      return true;
    });

    // 2. Sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === "price_asc") {
        return Number(a.price || 0) - Number(b.price || 0);
      }
      if (sortBy === "price_desc") {
        return Number(b.price || 0) - Number(a.price || 0);
      }
      if (sortBy === "stock_desc") {
        return Number(b.stock || 0) - Number(a.stock || 0);
      }
      if (sortBy === "stock_asc") {
        return Number(a.stock || 0) - Number(b.stock || 0);
      }
      if (sortBy === "name_asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      // 'newest' default
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });
  }, [products, searchQuery, statusTab, selectedCategory, selectedVendor, isSuperAdmin, sortBy]);

  // Statistics calculation
  const stats = useMemo(() => {
    const list = products || [];
    const published = list.filter(
      (p) => p.is_active !== false && (p.status ? p.status === "published" : true)
    ).length;
    const drafts = list.filter((p) => p.status === "draft").length;
    const lowStock = list.filter(
      (p) =>
        p.is_low_stock ||
        p.is_out_of_stock ||
        (p.stock != null && Number(p.stock) <= (p.low_stock_threshold ?? 5))
    ).length;

    return [
      {
        title: "Total Catalog",
        value: String(list.length),
        description: isSuperAdmin ? "Products across all vendors" : "Products in your inventory",
        icon: Package,
        gradient: "from-emerald-500/10 to-teal-500/10 border-emerald-200/60 text-emerald-700",
        iconBg: "bg-emerald-600 text-white",
      },
      {
        title: "Live in Store",
        value: String(published),
        description: "Active & purchasable listings",
        icon: ShoppingBag,
        gradient: "from-blue-500/10 to-indigo-500/10 border-blue-200/60 text-blue-700",
        iconBg: "bg-blue-600 text-white",
      },
      {
        title: "Drafts / Pending",
        value: String(drafts),
        description: "Unpublished internal drafts",
        icon: Layers,
        gradient: "from-zinc-500/10 to-stone-500/10 border-zinc-200 text-zinc-700",
        iconBg: "bg-zinc-700 text-white",
      },
      {
        title: "Low & Out of Stock",
        value: String(lowStock),
        description: "At or below alert threshold",
        icon: AlertCircle,
        gradient: "from-amber-500/10 to-orange-500/10 border-amber-200/60 text-amber-700",
        iconBg: "bg-amber-600 text-white",
      },
    ];
  }, [products, isSuperAdmin]);

  const onCreated = (product) => {
    setNotice(product?.name ? `"${product.name}" created successfully.` : "Product created successfully.");
    window.setTimeout(() => setNotice(""), 4500);
    fetchProducts(false);
  };

  const onUpdated = (product) => {
    setNotice(product?.name ? `"${product.name}" updated successfully.` : "Product updated successfully.");
    window.setTimeout(() => setNotice(""), 4500);
    fetchProducts(false);
  };

  const onDeleted = (product) => {
    setNotice(product?.name ? `"${product.name}" deleted.` : "Product deleted.");
    window.setTimeout(() => setNotice(""), 4500);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedVendor("all");
    setStatusTab("all");
    setSortBy("newest");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedVendor !== "all" ||
    statusTab !== "all" ||
    sortBy !== "newest";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Products Management
            </h1>
            <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-0.5 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              {isSuperAdmin ? "Master Marketplace Catalog" : user?.company_name || "Vendor Store"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl">
            {isSuperAdmin
              ? "Oversee, view details, edit, and manage products across all approved vendors in the Leaf agricultural marketplace."
              : "Manage inventory, update selling prices, inspect product details, monitor stock alerts, and list agricultural products for farmers."}
          </p>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="h-11 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold gap-2 shadow-md shadow-emerald-600/20 self-start sm:self-auto cursor-pointer transition-all"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add New Product</span>
        </Button>
      </div>

      {/* Success Notification Alert */}
      {notice ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button
            onClick={() => setNotice("")}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Key Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              className={`p-5 rounded-3xl bg-white border ${stat.gradient} shadow-xs transition-all hover:shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-3xl font-extrabold text-zinc-900 mt-1 tracking-tight">{stat.value}</p>
                  <p className="text-[11px] text-zinc-400 mt-1 font-medium">{stat.description}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-xs ${stat.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filter and Control Bar */}
      <Card className="p-4 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-3.5">
        {/* Status Tabs and View Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-zinc-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Items", count: (products || []).length },
              {
                id: "published",
                label: "Published",
                count: (products || []).filter((p) => p.status === "published" && p.is_active !== false).length,
              },
              {
                id: "draft",
                label: "Drafts",
                count: (products || []).filter((p) => p.status === "draft").length,
              },
              {
                id: "low_stock",
                label: "Low / Out of Stock",
                count: (products || []).filter(
                  (p) =>
                    p.is_low_stock ||
                    p.is_out_of_stock ||
                    (p.stock != null && Number(p.stock) <= (p.low_stock_threshold ?? 5))
                ).length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  statusTab === tab.id
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    statusTab === tab.id ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-zinc-500 hover:text-red-600 font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors mr-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            ) : null}

            
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2 lg:col-span-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, SKU, brand, active ingredient..."
              className="h-10 pl-10 pr-9 text-xs rounded-xl border-zinc-200 bg-zinc-50/60 focus:bg-white"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {/* Category Filter */}
          <div className="relative lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 focus:bg-white text-xs font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Categories</option>
              {(categories || [])
                .filter((c) => c.is_active)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Vendor Filter (Superadmin Only) */}
          {isSuperAdmin ? (
            <div className="relative lg:col-span-3">
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-amber-200 bg-amber-50/40 focus:bg-white text-xs font-semibold text-amber-900 outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="all">All Vendors</option>
                {(vendors || []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.company_name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="hidden lg:block lg:col-span-3"></div>
          )}

          {/* Sort By Dropdown */}
          <div className="relative lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50/60 focus:bg-white text-xs font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_desc">Stock: High to Low</option>
              <option value="stock_asc">Stock: Low to High</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error Notice */}
      {error && (products || []).length === 0 ? (
        <Card className="rounded-3xl border border-amber-200 bg-amber-50/70 shadow-xs p-5 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="font-bold text-sm">Could not load the product list</p>
            <p className="mt-0.5 text-amber-800">{error}. You can still add products using the dialog.</p>
          </div>
        </Card>
      ) : null}

      {/* Products Presentation: Executive Interactive Workspace Stream (Non-Card) */}
      {processedProducts.length > 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
          {/* Header count bar */}
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/60 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900">Marketplace Catalog Stream</span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                {processedProducts.length} items
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">
              Click any product row or view button to inspect complete agricultural specifications
            </p>
          </div>

          {/* Responsive Stream Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 bg-zinc-50/90 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3.5 pl-6 pr-4">Product</th>
                  <th className="py-3.5 px-4">Category & Brand</th>
                  {isSuperAdmin && (
                    <th className="py-3.5 px-4">Vendor Merchant</th>
                  )}
                  <th className="py-3.5 px-4">Selling Price</th>
                  <th className="py-3.5 px-4">Stock & Health</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700 font-medium">
                {processedProducts.map((p) => {
                  const isOutOfStock = p.stock === 0 || p.is_out_of_stock;
                  const isLowStock =
                    !isOutOfStock &&
                    (p.is_low_stock || (p.stock != null && Number(p.stock) <= (p.low_stock_threshold ?? 5)));
                  const hasDiscount =
                    p.compare_at_price && Number(p.compare_at_price) > Number(p.price);

                  return (
                    <tr
                      key={p.id ?? p.slug ?? p.sku ?? p.name}
                      className="hover:bg-emerald-50/25 transition-all duration-150 group cursor-pointer"
                      onClick={() => setViewProduct(p)}
                    >
                      {/* Product Thumbnail & Identity */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200/80 p-1 shrink-0 flex items-center justify-center overflow-hidden group-hover:border-emerald-300 transition-colors">
                            {p.image ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={p.image}
                                alt={p.name}
                                className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-zinc-300" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <p
                              className="font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors truncate text-sm"
                              title={p.name}
                            >
                              {p.name || "Untitled Product"}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-zinc-400">
                              <span className="font-mono text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                                SKU: {p.sku || "N/A"}
                              </span>
                              {p.is_organic && (
                                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1">
                                  <Leaf className="h-2.5 w-2.5" /> Organic
                                </span>
                              )}
                              {(p.pack_size || p.unit) && (
                                <span className="text-zinc-500 font-semibold text-[10px]">
                                  {p.pack_size ? `${p.pack_size} ` : ""}
                                  {p.unit ? p.unit.toUpperCase() : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50 inline-block mb-1">
                          {p.category_name || p.category?.name || "General"}
                        </span>
                        <div className="text-xs text-zinc-600 font-semibold">
                          {p.brand || <span className="text-zinc-300">—</span>}
                        </div>
                        {p.active_ingredient && (
                          <span className="text-[10px] text-zinc-400 truncate max-w-[140px] block mt-0.5" title={p.active_ingredient}>
                            {p.active_ingredient}
                          </span>
                        )}
                      </td>

                      {/* Vendor Merchant (Superadmin only) */}
                      {isSuperAdmin && (
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-950 bg-amber-50/80 border border-amber-200/60 px-2.5 py-1 rounded-xl">
                            <Store className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <span className="truncate max-w-[140px]">{p.vendor_name || "Leaf Direct"}</span>
                          </span>
                        </td>
                      )}

                      {/* Price & Discounts */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-extrabold text-zinc-950 font-display tracking-tight">
                            {fmtPrice(p.price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-[11px] text-zinc-400 line-through">
                              {fmtPrice(p.compare_at_price)}
                            </span>
                          )}
                        </div>
                        {hasDiscount && p.discount_percentage ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md inline-block mt-0.5">
                            -{p.discount_percentage}% OFF
                          </span>
                        ) : null}
                      </td>

                      {/* Stock & Health */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div>
                          {isOutOfStock ? (
                            <span className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 text-[11px] font-bold inline-flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 text-[11px] font-bold inline-flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                              Low: {p.stock} units
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold inline-flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              {p.stock ?? 0} in stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Listing Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            p.status === "draft"
                              ? "bg-zinc-100 text-zinc-700 border-zinc-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {p.status === "draft" ? "Draft" : "Published"}
                        </span>
                      </td>

                      {/* Dedicated Actions */}
                      <td
                        className="py-4 pl-4 pr-6 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewProduct(p)}
                            title="View Details"
                            className="h-8.5 px-3 rounded-xl bg-zinc-900 hover:bg-emerald-600 text-white text-xs font-bold gap-1.5 inline-flex items-center justify-center transition-all cursor-pointer shadow-xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditProduct(p)}
                            title="Edit Product"
                            className="h-8.5 w-8.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-zinc-600 inline-flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteProduct(p)}
                            title="Delete Product"
                            className="h-8.5 w-8.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-rose-600 hover:text-white hover:border-rose-600 text-zinc-600 inline-flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : hasActiveFilters ? (
        /* Empty Filter Search State */
        <Card className="rounded-3xl border border-zinc-200/80 bg-white shadow-xs p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 mb-3.5">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 mb-1">No Matching Products Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
            We couldn&apos;t find any products matching your active filters and search terms.
          </p>
          <Button
            onClick={resetFilters}
            variant="outline"
            className="h-10 px-4 rounded-xl border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            Clear All Filters
          </Button>
        </Card>
      ) : (
        /* Catalog Empty State */
        <Card className="rounded-3xl border border-zinc-200/80 bg-white shadow-xs p-12 sm:p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-4 shadow-xs">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 mb-1">No Products in Catalog Yet</h3>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto mb-6 leading-relaxed">
            {isSuperAdmin
              ? "Start adding products on behalf of approved vendors to showcase agricultural products in the Leaf marketplace."
              : "Your vendor store is currently empty. Add your first agricultural product to start receiving farmer orders."}
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2 shadow-md shadow-emerald-600/20 cursor-pointer inline-flex items-center"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Your First Product</span>
          </Button>
        </Card>
      )}

      {/* Add Product Dialog Modal */}
      <AddProductDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={onCreated}
      />

      {/* View Product Details Dialog Modal */}
      <ViewProductDetailsDialog
        product={viewProduct}
        isOpen={Boolean(viewProduct)}
        onClose={() => setViewProduct(null)}
        onEdit={(p) => setEditProduct(p)}
        onDelete={(p) => setDeleteProduct(p)}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Edit Product Dialog Modal */}
      <EditProductDialog
        product={editProduct}
        isOpen={Boolean(editProduct)}
        onClose={() => setEditProduct(null)}
        onUpdated={onUpdated}
      />

      {/* Delete Product Confirmation Dialog Modal */}
      <DeleteProductDialog
        product={deleteProduct}
        isOpen={Boolean(deleteProduct)}
        onClose={() => setDeleteProduct(null)}
        onDeleted={onDeleted}
      />
    </div>
  );
}
