"use client";

import React, { useState, useEffect } from "react";
import { X, FolderTree, Sparkles, AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddEditCategoryModal({
  isOpen,
  category = null, // null for create, category object for edit
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  const isEdit = Boolean(category);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || "");
        setDescription(category.description || "");
        setIsActive(category.is_active ?? true);
      } else {
        setName("");
        setDescription("");
        setIsActive(true);
      }
      setError("");
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  // Auto-generate preview slug
  const previewSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a category name.");
      return;
    }

    setError("");
    const result = await onSubmit({
      name: name.trim(),
      description: description.trim(),
      is_active: isActive,
    });

    if (result && !result.success) {
      setError(result.error || "Failed to save category. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-lg rounded-[28px] bg-white p-6 sm:p-7 shadow-2xl border border-black/[0.08] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-xs">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 tracking-tight">
                {isEdit ? "Edit Category" : "Add New Category"}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {isEdit
                  ? "Update department classification and visibility."
                  : "Create a new department taxonomy for marketplace products."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g., Indoor Plants, Organic Seeds, Fertilizers"
              className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 bg-white text-xs font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
            />
            {/* Slug Preview */}
            <div className="flex items-center gap-1.5 mt-1.5 px-1 text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-500">Slug:</span>
              <span className="font-mono text-emerald-700 bg-emerald-50/70 border border-emerald-100 rounded-md px-1.5 py-0.2">
                {previewSlug || (category?.slug || "auto-generated")}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
              Description <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a short description or guidelines for vendors adding products to this category..."
              className="w-full p-3 rounded-xl border border-zinc-200 bg-white text-xs font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all resize-none"
            />
          </div>

          {/* Active Status Checkbox / Switch */}
          <div className="pt-2 pb-1">
            <label className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 cursor-pointer hover:bg-zinc-100/60 transition-colors">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300 cursor-pointer accent-emerald-600"
              />
              <div className="text-xs">
                <span className="font-bold text-zinc-900 block">
                  Active & Visible in Catalog
                </span>
                <span className="text-zinc-500 text-[11px] leading-tight block mt-0.5">
                  When active, vendors can link their products to this category and customers can browse it.
                </span>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
              className="h-10 px-4 rounded-xl border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : isEdit ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Add Category</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
