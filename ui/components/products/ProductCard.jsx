"use client";

import React, { useState } from "react";
import {
  Store,
  Leaf,
  Eye,
  Tag,
  AlertCircle,
  CheckCircle2,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Sparkles,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";

export function formatPrice(value) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return `PKR ${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function getProductImageUrl(img) {
  if (!img) return null;
  if (typeof img === "string") {
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
    const host = apiUrl.replace(/\/api\/?$/, "");
    return `${host}${img.startsWith("/") ? "" : "/"}${img}`;
  }
  return null;
}

// Category icons helper
export function getCategoryIcon(catName) {
  const lower = (catName || "").toLowerCase();
  if (lower.includes("fertiliz")) return "🌾";
  if (lower.includes("fungicid") || lower.includes("pesticid")) return "🧪";
  if (lower.includes("seed")) return "🌱";
  if (lower.includes("growth") || lower.includes("tonic")) return "✨";
  if (lower.includes("organic") || lower.includes("bio")) return "🌿";
  if (lower.includes("tool") || lower.includes("equip")) return "🛠️";
  return "🏷️";
}

export default function ProductCard({ product, onViewDetails, viewMode = "grid" }) {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const { addToCart, updateQuantity, getItemQuantity } = useCartStore();

  if (!product) return null;

  const imgSrc = getProductImageUrl(product.image);
  const isOutOfStock = product.stock === 0 || product.is_out_of_stock;
  const hasDiscount =
    product.compare_at_price && Number(product.compare_at_price) > Number(product.price);
  const discountPercent =
    hasDiscount && product.compare_at_price > 0
      ? Math.round(
          ((Number(product.compare_at_price) - Number(product.price)) /
            Number(product.compare_at_price)) *
            100
        )
      : null;

  const inCartQty = getItemQuantity(product.id);
  const catIcon = getCategoryIcon(product.category_name);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateQuantity(product.id, inCartQty - 1);
  };

  // ─────────────────────────────────────────────────────────────
  // LIST VIEW LAYOUT (Horizontal Row Card)
  // ─────────────────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <div
        onClick={() => onViewDetails?.(product)}
        className="group relative flex flex-col sm:flex-row bg-white rounded-3xl border border-zinc-200/90 shadow-2xs hover:border-fern/50 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
      >
        {/* Left Image Area */}
        <div className="relative w-full sm:w-56 h-48 sm:h-auto shrink-0 bg-gradient-to-br from-emerald-50/60 via-mist/20 to-zinc-100 overflow-hidden">
          {imgSrc && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt={product.name}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
              <Leaf className="h-8 w-8 text-fern/60" />
              <span className="mt-1 text-[11px] font-semibold text-soil/60">
                {product.category_name || "Agri Product"}
              </span>
            </div>
          )}

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-zinc-800 shadow-xs border border-zinc-200/80">
              <span>{catIcon}</span>
              <span>{product.category_name || "General"}</span>
            </span>
          </div>

          {product.is_organic && (
            <div className="absolute bottom-2.5 left-3">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-700/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                <Leaf className="h-2.5 w-2.5" />
                Organic
              </span>
            </div>
          )}
        </div>

        {/* Center Content */}
        <div className="flex flex-1 flex-col justify-between p-5 min-w-0">
          <div>
            {/* Vendor Indicator */}
            <div className="flex items-center gap-1.5 text-xs text-soil/75 font-medium mb-1">
              <Store className="h-3.5 w-3.5 text-fern shrink-0" />
              <span className="truncate">
                Sold by <span className="font-semibold text-canopy">{product.vendor_name || "Leaf Direct"}</span>
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            </div>

            {/* Product Name */}
            <h3 className="font-display text-lg font-bold text-zinc-900 group-hover:text-canopy transition-colors line-clamp-1">
              {product.name}
            </h3>

            {/* Brand & Pack Specs */}
            {(product.brand || product.pack_size) && (
              <p className="mt-1 text-xs text-zinc-500">
                {product.brand && <span className="font-semibold text-zinc-700">{product.brand}</span>}
                {product.brand && product.pack_size && <span> • </span>}
                {product.pack_size && <span>Pack: {product.pack_size} {product.unit || ""}</span>}
              </p>
            )}

            {/* Active formula */}
            {product.active_ingredient && (
              <p className="mt-1.5 text-xs text-zinc-500 italic line-clamp-1">
                <strong className="not-italic text-zinc-700 font-medium">Formula:</strong> {product.active_ingredient}
              </p>
            )}

            {/* Short snippet */}
            {(product.short_description || product.description) && (
              <p className="mt-2 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                {product.short_description || product.description}
              </p>
            )}
          </div>

          {/* Bottom row: In Stock indicator */}
          <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1 font-bold ${
                isOutOfStock ? "text-rose-600" : "text-emerald-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isOutOfStock ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                }`}
              />
              {isOutOfStock ? "Out of Stock" : "In Stock"}
            </span>
          </div>
        </div>

        {/* Right Action & Price Column */}
        <div className="sm:w-56 p-5 sm:border-l border-t sm:border-t-0 border-zinc-100 bg-zinc-50/50 flex flex-col justify-between shrink-0">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 block uppercase tracking-wider">
              Price
            </span>
            <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-bold text-canopy">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <span className="text-xs text-zinc-400 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>
            {discountPercent && (
              <span className="mt-1 inline-block text-[11px] font-bold text-blight">
                Save {discountPercent}%
              </span>
            )}
            {product.unit && !product.pack_size && (
              <span className="text-[10px] text-zinc-400 block">per {product.unit}</span>
            )}
          </div>

          <div className="mt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
            {isOutOfStock ? (
              <button
                disabled
                className="w-full h-9 rounded-xl bg-zinc-100 text-zinc-400 text-xs font-bold cursor-not-allowed"
              >
                Out of Stock
              </button>
            ) : inCartQty > 0 ? (
              <div className="flex items-center justify-between rounded-xl border border-canopy/20 bg-white p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-canopy hover:bg-zinc-200 transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-xs font-bold text-canopy px-2">{inCartQty} in cart</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-canopy text-husk hover:bg-canopy/90 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  justAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-canopy text-husk hover:bg-canopy/90 active:scale-98"
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add to Cart
                  </>
                )}
              </button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(product)}
              className="w-full h-8 rounded-xl text-xs font-semibold border-zinc-200 text-zinc-700 hover:bg-white"
            >
              <Eye className="h-3 w-3 mr-1" />
              Quick View
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // GRID VIEW LAYOUT (Modern Compact Vertical Card)
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      onClick={() => onViewDetails?.(product)}
      className="group relative flex flex-col bg-white rounded-3xl border border-zinc-200/90 shadow-2xs hover:border-fern/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-emerald-50/60 via-mist/20 to-zinc-100">
        {imgSrc && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fern/10 text-fern transition-transform duration-300 group-hover:scale-110">
              <Leaf className="h-7 w-7" />
            </div>
            <span className="mt-2 text-[11px] font-semibold text-soil/60">
              {product.category_name || "Agricultural Care"}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute left-3 top-3 right-3 flex items-center justify-between pointer-events-none gap-2">
          {/* Category Pill */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-zinc-800 shadow-xs border border-zinc-200/80">
            <span>{catIcon}</span>
            <span className="max-w-[110px] truncate">{product.category_name || "General"}</span>
          </span>

          {/* Stock Badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-md shadow-xs border ${
              isOutOfStock
                ? "bg-rose-50/95 text-rose-700 border-rose-200"
                : "bg-emerald-50/95 text-emerald-800 border-emerald-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOutOfStock ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
              }`}
            />
            {isOutOfStock ? "Out of Stock" : "In Stock"}
          </span>
        </div>

        {/* Floating Quick View button on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-canopy/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-canopy shadow-lg border border-white">
            <Eye className="h-3.5 w-3.5" />
            Quick View
          </span>
        </div>

        {/* Bottom tags: Organic & Discount */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
          {product.is_organic ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-700/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
              <Leaf className="h-2.5 w-2.5" />
              100% Organic
            </span>
          ) : (
            <span />
          )}

          {discountPercent && (
            <span className="inline-flex items-center rounded-md bg-blight px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Card Body - Showing only necessary details with high elegance */}
      <div className="flex flex-1 flex-col p-4.5">
        {/* Vendor Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-soil/75 font-medium">
          <Store className="h-3.5 w-3.5 text-fern shrink-0" />
          <span className="truncate">
            Sold by{" "}
            <span className="font-semibold text-canopy">
              {product.vendor_name || "Leaf Direct"}
            </span>
          </span>
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0 ml-0.5" title="Verified Vendor" />
        </div>

        {/* Product Name */}
        <h3
          className="mt-1.5 font-display text-base font-bold text-zinc-900 group-hover:text-canopy transition-colors line-clamp-1 leading-snug"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Brand & Pack Specs */}
        {(product.brand || product.pack_size) && (
          <p className="mt-1 text-xs text-zinc-500 truncate">
            {product.brand && <span className="font-semibold text-zinc-700">{product.brand}</span>}
            {product.brand && product.pack_size && <span> • </span>}
            {product.pack_size && (
              <span>
                {product.pack_size} {product.unit || ""}
              </span>
            )}
          </p>
        )}

        {/* Active Ingredient / Formula */}
        {product.active_ingredient && (
          <p
            className="mt-1 text-[11px] text-zinc-400 font-medium italic truncate"
            title={product.active_ingredient}
          >
            Formula: {product.active_ingredient}
          </p>
        )}

        {/* Pricing & Add to Cart Footer */}
        <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
          {/* Price */}
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-canopy">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-zinc-400 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>
            {product.unit && !product.pack_size && (
              <span className="text-[10px] text-zinc-400 block -mt-0.5">per {product.unit}</span>
            )}
          </div>

          {/* Add to Cart Controls */}
          <div onClick={(e) => e.stopPropagation()}>
            {isOutOfStock ? (
              <span className="inline-block rounded-xl bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-400 cursor-not-allowed">
                Out of Stock
              </span>
            ) : inCartQty > 0 ? (
              /* Already in cart: Quantity Stepper */
              <div className="flex items-center gap-1.5 rounded-xl border border-canopy/20 bg-husk/50 p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-canopy hover:bg-zinc-100 shadow-2xs transition-colors"
                  title="Reduce quantity"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[18px] text-center text-xs font-bold text-canopy">
                  {inCartQty}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-canopy text-husk hover:bg-canopy/90 shadow-2xs transition-colors"
                  title="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            ) : (
              /* Not in cart: Add Button */
              <button
                type="button"
                onClick={handleAddToCart}
                className={`h-8.5 rounded-xl px-3 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  justAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-canopy text-husk hover:bg-canopy/90 active:scale-95"
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
