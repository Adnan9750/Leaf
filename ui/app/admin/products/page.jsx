"use client";

import React, { useState } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Layers,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";

export default function ProductsPage() {
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const isVendor = !user?.is_superuser && user?.role !== "admin";

  const stats = [
    {
      title: "Total Products",
      value: "0",
      description: "Items in your catalog",
      icon: Package,
      iconColor: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Active Listings",
      value: "0",
      description: "Visible to customers",
      icon: ShoppingBag,
      iconColor: "text-blue-600 bg-blue-50",
    },
    {
      title: "Low / Out of Stock",
      value: "0",
      description: "Requires attention",
      icon: AlertCircle,
      iconColor: "text-amber-600 bg-amber-50",
    },
    {
      title: "Categories",
      value: "0",
      description: "Active departments",
      icon: Layers,
      iconColor: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Products
            </h1>
            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold">
              {isVendor ? (user?.company_name || "Vendor Store") : "Catalog"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500">
            {isVendor
              ? "Manage, update, and track your store's product inventory and pricing."
              : "Overview of all marketplace products and inventory across vendors."}
          </p>
        </div>

        <Button
          className="h-9 px-4 rounded-xl bg-canopy hover:bg-canopy/90 text-white text-xs font-semibold gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* 4 Stat Cards */}
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
                  <p className="text-xs font-medium text-zinc-500">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {stat.description}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconColor}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters Bar */}
      <Card className="p-3 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, SKU, or category..."
            className="h-9 pl-9 text-xs rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 rounded-xl border-zinc-200 text-xs font-medium text-zinc-600 gap-1.5 cursor-pointer w-full sm:w-auto"
          >
            <Filter className="h-3.5 w-3.5 text-zinc-400" />
            <span>Filter</span>
          </Button>
        </div>
      </Card>

      {/* Empty State Card */}
      <Card className="rounded-2xl border border-zinc-200/80 bg-white shadow-xs p-12 sm:p-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-4 shadow-xs">
          <Package className="h-8 w-8" />
        </div>

        <h3 className="text-base font-bold text-zinc-900 mb-1">
          No Products Added Yet
        </h3>

        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto mb-6">
          Your product catalog is currently empty. Start by adding your first product to showcase in the Leaf marketplace.
        </p>

        <Button
          className="h-9 px-5 rounded-xl bg-canopy hover:bg-canopy/90 text-white text-xs font-semibold gap-1.5 shadow-sm cursor-pointer inline-flex items-center"
        >
          <Plus className="h-4 w-4" />
          <span>Add Your First Product</span>
        </Button>
      </Card>
    </div>
  );
}
