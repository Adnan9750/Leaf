"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Store,
  Sparkles,
  Package,
  Leaf,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, getProductImageUrl } from "@/components/products/ProductCard";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getSubtotal,
    getTotalCount,
  } = useCartStore();

  const mounted = useMounted();
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  // Prevent background scroll when cart drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const totalCount = getTotalCount();
  const subtotal = getSubtotal();

  const handleCheckoutClick = () => {
    setCheckoutNotice(true);
    setTimeout(() => setCheckoutNotice(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={closeCart}
      />

      {/* Slide-over Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 animate-in slide-in-from-right sm:max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-canopy text-husk shadow-sm">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-canopy">Your Cart</h2>
                <span className="inline-flex items-center justify-center rounded-full bg-fern/15 px-2.5 py-0.5 text-xs font-bold text-fern">
                  {totalCount} {totalCount === 1 ? "item" : "items"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">Verified agricultural products</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-400 hover:text-rose-600 transition-colors"
                title="Clear all items"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={closeCart}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        {checkoutNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Order draft created! Direct vendor ordering and doorstep delivery integration is being enabled for your region.
            </span>
          </div>
        )}

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-mist/40 text-fern mb-4">
                <ShoppingCart className="h-10 w-10 stroke-[1.5]" />
              </div>
              <h3 className="font-display text-lg font-bold text-canopy">
                Your cart is empty
              </h3>
              <p className="mt-1.5 max-w-xs text-xs text-soil/70 leading-relaxed">
                Explore our catalog of certified fertilizers, fungicides, and crop care medicines to add items.
              </p>
              <Button
                onClick={closeCart}
                className="mt-6 bg-canopy text-husk hover:bg-canopy/90 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-sm"
              >
                Browse Products
              </Button>
            </div>
          ) : (
            items.map((item) => {
              const product = item.product || {};
              const imgSrc = getProductImageUrl(product.image);
              const maxStock = product.stock != null ? Number(product.stock) : 999;
              const itemTotal = (Number(product.price) || 0) * item.quantity;

              return (
                <div
                  key={item.id}
                  className="flex gap-3.5 rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-xs hover:border-fern/30 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 border border-zinc-200/60">
                    {imgSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imgSrc}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-fern/60">
                        <Leaf className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Info & Quantity */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display text-xs font-bold text-canopy line-clamp-1" title={product.name}>
                          {product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-400 hover:text-rose-600 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Vendor name */}
                      <div className="flex items-center gap-1 text-[11px] text-soil/70 mt-0.5">
                        <Store className="h-3 w-3 text-fern shrink-0" />
                        <span className="truncate">{product.vendor_name || "Leaf Direct"}</span>
                        {product.pack_size && (
                          <span className="text-zinc-400">• {product.pack_size} {product.unit || ""}</span>
                        )}
                      </div>
                    </div>

                    {/* Price & Counter */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-canopy">
                          {formatPrice(itemTotal)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-zinc-400">
                            ({formatPrice(product.price)} each)
                          </span>
                        )}
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-zinc-700 shadow-2xs hover:bg-zinc-100 disabled:opacity-40 transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>

                        <span className="min-w-[20px] text-center text-xs font-bold text-zinc-800">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          disabled={item.quantity >= maxStock}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-zinc-700 shadow-2xs hover:bg-zinc-100 disabled:opacity-40 transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary (if items in cart) */}
        {items.length > 0 && (
          <div className="border-t border-zinc-200/80 bg-zinc-50/90 p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Items Subtotal ({totalCount})</span>
                <span className="font-semibold text-zinc-800">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Estimated Delivery</span>
                <span className="text-emerald-700 font-medium">Calculated at checkout</span>
              </div>
              <div className="border-t border-zinc-200/60 pt-2 flex items-center justify-between">
                <span className="font-display font-bold text-sm text-canopy">Total Estimated</span>
                <span className="font-display font-bold text-lg text-canopy">{formatPrice(subtotal)}</span>
              </div>
            </div>

            {/* Guaranteed quality badge */}
            <div className="flex items-center gap-2 rounded-xl bg-white p-2.5 border border-zinc-200/70 text-[11px] text-zinc-600">
              <ShieldCheck className="h-4 w-4 text-fern shrink-0" />
              <span>Certified agricultural medicines verified by LeafLens botanists.</span>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <Button
                onClick={handleCheckoutClick}
                className="w-full h-11 bg-canopy text-husk hover:bg-canopy/90 rounded-xl font-bold text-xs shadow-md shadow-canopy/10 flex items-center justify-center gap-2"
              >
                <span>Proceed to Order / Inquiry</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <button
                type="button"
                onClick={closeCart}
                className="w-full text-center text-xs font-semibold text-zinc-500 hover:text-zinc-800 py-1 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
