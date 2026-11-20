"use client";

import React, { useState } from "react";
import {
  X,
  Store,
  Tag,
  Leaf,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  FileText,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, getProductImageUrl, getCategoryIcon } from "./ProductCard";

export default function PublicProductDetailModal({ product, isOpen, onClose }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const { addToCart, getItemQuantity } = useCartStore();

  if (!isOpen || !product) return null;

  const allImages = [];
  if (product.image) {
    allImages.push({ id: "cover", image: product.image, alt: product.name });
  }
  if (Array.isArray(product.images)) {
    product.images.forEach((img) => {
      if (img?.image && img.image !== product.image) {
        allImages.push({ id: img.id, image: img.image, alt: img.alt_text || product.name });
      }
    });
  }

  const currentImgRaw = selectedImage || product.image || allImages[0]?.image || null;
  const currentImgSrc = getProductImageUrl(currentImgRaw);

  const isOutOfStock = product.stock === 0 || product.is_out_of_stock;
  const maxStock = product.stock != null ? Number(product.stock) : 999;
  const hasDiscount =
    product.compare_at_price && Number(product.compare_at_price) > Number(product.price);
  const savings = hasDiscount ? Number(product.compare_at_price) - Number(product.price) : 0;

  const currentInCart = getItemQuantity(product.id);
  const catIcon = getCategoryIcon(product.category_name);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/65 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-zinc-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-zinc-800 border border-zinc-200 shadow-2xs">
              <span>{catIcon}</span>
              {product.category_name || "Product Details"}
            </span>
            {product.is_organic && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-700 text-white shadow-2xs">
                <Leaf className="h-3 w-3" />
                100% Organic
              </span>
            )}
            {currentInCart > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-canopy/10 text-canopy">
                <ShoppingCart className="h-3 w-3" />
                {currentInCart} in cart
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/70 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Image & Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square w-full rounded-2xl bg-zinc-100 border border-zinc-200/80 overflow-hidden flex items-center justify-center">
                {currentImgSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentImgSrc}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-400 p-6 text-center">
                    <Leaf className="h-12 w-12 text-fern/40" />
                    <span className="text-xs mt-2 font-medium">No photo available</span>
                  </div>
                )}

                {hasDiscount && (
                  <div className="absolute top-3 left-3 bg-blight text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shadow-sm">
                    Save {formatPrice(savings)}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {allImages.map((img) => {
                    const resolved = getProductImageUrl(img.image);
                    const isActive = (selectedImage || product.image) === img.image;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setSelectedImage(img.image)}
                        className={`relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                          isActive
                            ? "border-canopy ring-2 ring-canopy/20"
                            : "border-zinc-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resolved} alt={img.alt} className="h-full w-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Essential Details */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Vendor details */}
                <div className="flex items-center gap-1.5 text-xs text-soil/80 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-fern/10 text-fern flex items-center justify-center shrink-0">
                    <Store className="h-3.5 w-3.5" />
                  </div>
                  <span>
                    Sold by <strong className="text-canopy font-bold">{product.vendor_name || "Leaf Direct"}</strong>
                  </span>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                </div>

                {/* Product Name */}
                <h2 className="font-display text-2xl font-bold text-zinc-900 leading-tight">
                  {product.name}
                </h2>

                {/* Brand & SKU */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  {product.brand && (
                    <span className="font-semibold bg-zinc-100 px-2.5 py-0.5 rounded-md text-zinc-700">
                      Brand: {product.brand}
                    </span>
                  )}
                  {product.sku && <span>SKU: {product.sku}</span>}
                </div>

                {/* Price block */}
                <div className="mt-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-canopy">
                      {formatPrice(product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-zinc-400 line-through">
                        {formatPrice(product.compare_at_price)}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isOutOfStock ? "text-rose-600" : "text-emerald-700"
                      }`}
                    >
                      {isOutOfStock ? (
                        <>
                          <AlertCircle className="h-3.5 w-3.5" />
                          Out of Stock
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          In Stock ({product.stock ?? 1} units ready)
                        </>
                      )}
                    </span>

                    {(product.pack_size || product.unit) && (
                      <span className="text-zinc-500">
                        • Pack Size: {product.pack_size || ""} {product.unit || ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Active Ingredient */}
                {product.active_ingredient && (
                  <div className="mt-4 text-xs">
                    <span className="font-bold text-zinc-700">Active Formula:</span>{" "}
                    <span className="text-zinc-600 font-medium">{product.active_ingredient}</span>
                  </div>
                )}

                {/* Short Description */}
                {(product.short_description || product.description) && (
                  <div className="mt-3 text-xs leading-relaxed text-zinc-600">
                    <p className="line-clamp-4">
                      {product.short_description || product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Add to Cart Actions */}
              <div className="mt-6 pt-4 border-t border-zinc-100 space-y-3">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  {!isOutOfStock && (
                    <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-700 shadow-2xs hover:bg-zinc-100 disabled:opacity-40 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <span className="min-w-[28px] text-center text-xs font-bold text-zinc-800">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                        disabled={quantity >= maxStock}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-700 shadow-2xs hover:bg-zinc-100 disabled:opacity-40 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Add to Cart button */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 h-10 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all ${
                      justAdded
                        ? "bg-emerald-600 text-white"
                        : "bg-canopy text-husk hover:bg-canopy/90"
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="h-4 w-4 stroke-[3]" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        {isOutOfStock ? "Out of Stock" : `Add to Cart • ${formatPrice((Number(product.price) || 0) * quantity)}`}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Usage & Safety Details (if available) */}
          {(product.usage_instructions || product.safety_precautions) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
              {product.usage_instructions && (
                <div className="rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1.5">
                    <FileText className="h-3.5 w-3.5 text-fern" />
                    Usage Instructions
                  </div>
                  <p className="text-emerald-950/80 leading-relaxed whitespace-pre-line">
                    {product.usage_instructions}
                  </p>
                </div>
              )}

              {product.safety_precautions && (
                <div className="rounded-2xl bg-amber-50/50 p-4 border border-amber-100 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                    Safety Precautions
                  </div>
                  <p className="text-amber-950/80 leading-relaxed whitespace-pre-line">
                    {product.safety_precautions}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
