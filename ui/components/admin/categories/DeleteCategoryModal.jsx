"use client";

import React from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeleteCategoryModal({
  isOpen,
  category,
  onClose,
  onConfirm,
  isSubmitting = false,
}) {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl border border-black/[0.08] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Delete Category
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                This action is permanent and cannot be undone.
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

        {/* Content */}
        <div className="my-4 p-3.5 rounded-2xl bg-red-50/60 border border-red-100 text-xs text-red-800 leading-relaxed">
          Are you sure you want to delete <strong className="font-bold text-red-950">&ldquo;{category.name}&rdquo;</strong>?
          Any products classified under this category may become unassigned.
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
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
            type="button"
            disabled={isSubmitting}
            onClick={() => onConfirm(category.id)}
            className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold gap-1.5 shadow-sm shadow-red-600/20 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete Category</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
