"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  FileText,
  Image as ImageIcon,
  Info,
  Layers,
  Leaf,
  Package,
  Pencil,
  Percent,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function fmtPrice(value) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return `PKR ${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function ViewProductDetailsDialog({
  product,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  isSuperAdmin = false,
}) {
  const [selectedImage, setSelectedImage] = useState(null);

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

  const currentDisplayImage = selectedImage || product.image || allImages[0]?.image || null;

  const isOutOfStock = product.stock === 0 || product.is_out_of_stock;
  const isLowStock =
    !isOutOfStock &&
    (product.is_low_stock ||
      (product.stock != null && Number(product.stock) <= (product.low_stock_threshold ?? 5)));

  const hasDiscount =
    product.compare_at_price && Number(product.compare_at_price) > Number(product.price);
  const savings = hasDiscount ? Number(product.compare_at_price) - Number(product.price) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-zinc-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-100 bg-zinc-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600/10 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0">
              <Eye className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 truncate">
                  {product.name || "Product Details"}
                </h2>
                <span className="font-mono text-[11px] font-semibold text-zinc-500 bg-zinc-200/70 px-2 py-0.5 rounded-md">
                  SKU: {product.sku || "N/A"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">
                {product.category_name || product.category?.name || "Uncategorized"} &bull;{" "}
                {product.vendor_name || product.vendor?.company_name || "Leaf Direct"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
                className="h-9 px-3 rounded-xl border-zinc-200 text-xs font-semibold text-zinc-700 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 gap-1.5 cursor-pointer hidden sm:inline-flex"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Button>
            )}
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/70 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Gallery & Visuals */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative aspect-square rounded-2xl bg-zinc-100 border border-zinc-200/80 overflow-hidden flex items-center justify-center group shadow-xs">
                {currentDisplayImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={currentDisplayImage}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-400">
                    <ImageIcon className="h-12 w-12 text-zinc-300" />
                    <span className="text-xs font-medium">No Image Available</span>
                  </div>
                )}

                {/* Floating Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs border ${
                        product.status === "draft"
                          ? "bg-zinc-900/90 text-white border-zinc-700"
                          : "bg-emerald-600/90 text-white border-emerald-500"
                      }`}
                    >
                      {product.status === "draft" ? "Draft" : "Published"}
                    </span>

                    {product.is_organic && (
                      <span className="rounded-full bg-emerald-500/90 text-white border border-emerald-400 px-2.5 py-0.5 text-[10px] font-bold inline-flex items-center gap-1 shadow-xs">
                        <Leaf className="h-3 w-3" /> Organic
                      </span>
                    )}

                    {product.is_featured && (
                      <span className="rounded-full bg-amber-500/90 text-white border border-amber-400 px-2.5 py-0.5 text-[10px] font-bold inline-flex items-center gap-1 shadow-xs">
                        <Sparkles className="h-3 w-3" /> Featured
                      </span>
                    )}
                  </div>

                  {hasDiscount && (
                    <span className="rounded-full bg-red-600/90 text-white border border-red-500 px-2.5 py-0.5 text-[10px] font-bold inline-flex items-center gap-1 shadow-xs">
                      <Percent className="h-3 w-3" /> -{product.discount_percentage}%
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails row if multiple images exist */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={img.id || i}
                      type="button"
                      onClick={() => setSelectedImage(img.image)}
                      className={`relative h-16 w-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        currentDisplayImage === img.image
                          ? "border-emerald-600 ring-2 ring-emerald-500/30 scale-95"
                          : "border-zinc-200 hover:border-zinc-300 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.image} alt={img.alt} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Pricing, Stock, and Quick Facts */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              {/* Pricing Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-zinc-50 to-teal-50/30 border border-emerald-100/80 shadow-2xs space-y-3">
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                      Selling Price
                    </span>
                    <div className="flex items-baseline gap-2.5 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                        {fmtPrice(product.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm font-semibold text-zinc-400 line-through">
                          {fmtPrice(product.compare_at_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Status Badge */}
                  <div>
                    {isOutOfStock ? (
                      <span className="rounded-full bg-red-100 text-red-700 border border-red-200 px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-600" />
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                        Low Stock: {product.stock} left
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-600" />
                        In Stock: {product.stock} available
                      </span>
                    )}
                  </div>
                </div>

                {hasDiscount && (
                  <div className="text-xs font-semibold text-emerald-800 bg-emerald-100/60 rounded-xl px-3 py-1.5 inline-flex items-center gap-1.5 border border-emerald-200/60">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Farmers save {fmtPrice(savings)} ({product.discount_percentage}% OFF)
                  </div>
                )}

                {/* Admin/Owner Financial Insight */}
                {isSuperAdmin && product.cost_price != null && (
                  <div className="pt-2 border-t border-emerald-200/50 flex items-center justify-between text-xs text-zinc-600">
                    <span>
                      Internal Cost: <strong>{fmtPrice(product.cost_price)}</strong>
                    </span>
                    {Number(product.price) > Number(product.cost_price) && (
                      <span className="text-emerald-700 font-semibold">
                        Estimated Margin: {fmtPrice(Number(product.price) - Number(product.cost_price))}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Brand
                  </span>
                  <p className="text-xs font-bold text-zinc-800 mt-0.5 truncate">
                    {product.brand || "—"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Pack Size
                  </span>
                  <p className="text-xs font-bold text-zinc-800 mt-0.5 truncate">
                    {product.pack_size ? `${product.pack_size} ` : ""}
                    {product.unit ? product.unit.toUpperCase() : "PIECE"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Alert Threshold
                  </span>
                  <p className="text-xs font-bold text-zinc-800 mt-0.5 truncate">
                    {product.low_stock_threshold ?? 5} units
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Category
                  </span>
                  <p className="text-xs font-bold text-zinc-800 mt-0.5 truncate">
                    {product.category_name || product.category?.name || "Uncategorized"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Vendor Partner
                  </span>
                  <p className="text-xs font-bold text-amber-900 mt-0.5 truncate">
                    {product.vendor_name || product.vendor?.company_name || "Leaf Direct"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Status
                  </span>
                  <p className="text-xs font-bold text-zinc-800 mt-0.5 capitalize truncate">
                    {product.status || "published"}
                  </p>
                </div>
              </div>

              {/* Short summary */}
              {product.short_description && (
                <div className="p-3.5 rounded-xl bg-zinc-50/80 border border-zinc-200/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Summary
                  </span>
                  <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                    {product.short_description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Agricultural Specifications Card */}
          {(product.active_ingredient || product.usage_instructions || product.safety_precautions) && (
            <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 space-y-4">
              <div className="flex items-center gap-2 text-emerald-900">
                <Leaf className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Agricultural Specifications & Application
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {product.active_ingredient && (
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Active Ingredient
                    </span>
                    <p className="text-xs font-semibold text-zinc-800 mt-1 leading-snug">
                      {product.active_ingredient}
                    </p>
                  </div>
                )}

                {product.usage_instructions && (
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Usage Instructions
                    </span>
                    <p className="text-xs text-zinc-700 mt-1 leading-relaxed whitespace-pre-line font-medium">
                      {product.usage_instructions}
                    </p>
                  </div>
                )}

                {product.safety_precautions && (
                  <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/30 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3 text-amber-600" /> Safety Precautions
                    </span>
                    <p className="text-xs text-zinc-700 mt-1 leading-relaxed whitespace-pre-line font-medium">
                      {product.safety_precautions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Detailed Description */}
          {product.description && (
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/60 space-y-2">
              <div className="flex items-center gap-2 text-zinc-800">
                <FileText className="h-4 w-4 text-zinc-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Product Description</h3>
              </div>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Superadmin Moderation Warning if Blocked */}
          {product.is_active === false && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Product is Blocked from Storefront</strong>
                {product.blocked_reason && (
                  <p className="mt-1 text-red-700 font-medium">Reason: {product.blocked_reason}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50/80">
          <div className="text-[11px] text-zinc-400 font-medium">
            Slug: <span className="font-mono text-zinc-600">{product.slug}</span>
          </div>

          <div className="flex items-center gap-2.5">
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onDelete(product);
                }}
                className="h-9 px-4 rounded-xl border-zinc-200 text-xs font-semibold text-zinc-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            )}

            {onEdit && (
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
                className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-sm shadow-blue-600/20 cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit Product</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 px-4 rounded-xl border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

