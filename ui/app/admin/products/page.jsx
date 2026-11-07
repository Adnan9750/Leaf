"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Image as ImageIcon,
  Layers,
  Package,
  Plus,
  Search,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { useProductStore } from "@/store/productStore";
import { useCategoryStore } from "@/store/categoryStore";
import AddProductDialog from "@/components/admin/products/AddProductDialog";

function fmtPrice(value) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return `PKR ${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function ProductsPage() {
  const user = useAuthStore((state) => state.user);
  const isVendor = !user?.is_superuser && user?.role !== "admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const { products, fetchProducts, isLoading, error } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchProducts(false);
    fetchCategories("all", "", false);
  }, [fetchProducts, fetchCategories]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products || [];
    return (products || []).filter((p) => {
      const hay = [p.name, p.sku, p.brand, p.category_name, p.category?.name, p.slug]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [products, searchQuery]);

  const stats = useMemo(() => {
    const list = products || [];
    const active = list.filter(
      (p) => p.is_active !== false && (p.status ? p.status === "published" : true)
    ).length;
    const low = list.filter(
      (p) =>
        (typeof p.is_low_stock === "boolean" && p.is_low_stock) ||
        (typeof p.is_out_of_stock === "boolean" && p.is_out_of_stock) ||
        (p.stock != null && Number(p.stock) <= (p.low_stock_threshold ?? 5))
    ).length;
    return [
      {
        title: "Total Products",
        value: String(list.length),
        description: "Items in your catalog",
        icon: Package,
        iconColor: "text-emerald-600 bg-emerald-50",
      },
      {
        title: "Active Listings",
        value: String(active),
        description: "Visible to customers",
        icon: ShoppingBag,
        iconColor: "text-blue-600 bg-blue-50",
      },
      {
        title: "Low / Out of Stock",
        value: String(low),
        description: "Requires attention",
        icon: AlertCircle,
        iconColor: "text-amber-600 bg-amber-50",
      },
      {
        title: "Categories",
        value: String((categories || []).filter((c) => c.is_active).length),
        description: "Active departments",
        icon: Layers,
        iconColor: "text-purple-600 bg-purple-50",
      },
    ];
  }, [products, categories]);

  const onCreated = (product) => {
    setNotice(product?.name ? `“${product.name}” created successfully.` : "Product created successfully.");
    window.setTimeout(() => setNotice(""), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Products
            </h1>
            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold">
              {isVendor ? user?.company_name || "Vendor Store" : "Catalog"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500">
            {isVendor
              ? "Manage, update, and track your store's product inventory and pricing."
              : "Overview of all marketplace products and inventory across vendors."}
          </p>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="h-9 px-4 rounded-xl bg-canopy hover:bg-canopy/90 text-white text-xs font-semibold gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {notice ? (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          {notice}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              className="p-4.5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{stat.description}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-3 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, SKU, brand, or category..."
            className="h-9 pl-9 text-xs rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white"
          />
        </div>
        {isLoading ? <span className="text-[11px] text-zinc-400">Loading…</span> : null}
      </Card>

      {error && (products || []).length === 0 ? (
        <Card className="rounded-2xl border border-amber-200 bg-amber-50/60 shadow-xs p-4 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Could not load the product list.</p>
            <p className="mt-0.5 text-amber-800/90">{error}. You can still add products using the dialog.</p>
          </div>
        </Card>
      ) : null}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card
              key={p.id ?? p.slug ?? p.sku ?? p.name}
              className="rounded-2xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden flex flex-col"
            >
              <div className="h-36 bg-zinc-100 flex items-center justify-center overflow-hidden">
                {p.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-zinc-300" />
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{p.name || "Untitled"}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                      {p.category_name || p.category?.name || "Uncategorized"}
                      {p.sku ? ` · ${p.sku}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                      p.status === "draft"
                        ? "bg-zinc-100 text-zinc-600 border-zinc-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {p.status || "published"}
                  </span>
                </div>
                {p.short_description ? (
                  <p className="text-[11px] text-zinc-500 mt-2 line-clamp-2">{p.short_description}</p>
                ) : null}
                <div className="mt-auto pt-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900">{fmtPrice(p.price)}</span>
                  <span className="text-zinc-500">Stock: {p.stock ?? 0}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border border-zinc-200/80 bg-white shadow-xs p-12 sm:p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-4 shadow-xs">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 mb-1">No Products Added Yet</h3>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto mb-6">
            Your product catalog is currently empty. Start by adding your first product to showcase in the Leaf marketplace.
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="h-9 px-5 rounded-xl bg-canopy hover:bg-canopy/90 text-white text-xs font-semibold gap-1.5 shadow-sm cursor-pointer inline-flex items-center"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Product</span>
          </Button>
        </Card>
      )}

      <AddProductDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={onCreated}
      />
    </div>
  );
}
