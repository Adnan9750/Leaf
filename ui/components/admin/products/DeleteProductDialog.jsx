"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/store/productStore";

export default function DeleteProductDialog({ product, isOpen, onClose, onDeleted }) {
  const { deleteProduct } = useProductStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await deleteProduct(product.id);
      if (!result.success) {
        setError(result.error || "Failed to delete product.");
        return;
      }
      onDeleted?.(product);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog Panel */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-zinc-200/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Delete Product</h2>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">This action cannot be undone</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-900 mb-1">
                Are you sure you want to delete &ldquo;{product.name}&rdquo;?
              </p>
              <p className="text-[11px] text-red-700 leading-relaxed">
                This will permanently remove the product, all its gallery images, and all associated data
                from the marketplace. Orders referencing this product will not be affected.
              </p>
            </div>
          </div>

          {/* Product info pill */}
          <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 rounded-2xl border border-zinc-100">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image}
                alt={product.name}
                className="h-10 w-10 rounded-xl object-cover border border-zinc-200 shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-zinc-200 border border-zinc-200 shrink-0 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-zinc-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">{product.name}</p>
              <p className="text-[11px] text-zinc-500 font-medium">
                SKU: {product.sku} &bull; {product.category_name || "Uncategorized"}
              </p>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-700 font-medium flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="h-10 px-5 rounded-2xl border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="h-10 px-5 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold gap-2 shadow-md shadow-red-600/20 cursor-pointer transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" /> Yes, Delete Product
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

