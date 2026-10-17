"use client";

import React from "react";
import {
  FolderTree,
  Calendar,
  Edit2,
  Trash2,
  Power,
  Hash,
  Sparkles,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CategoryCardsView({
  categories = [],
  onEdit,
  onDelete,
  onToggleStatus,
  onAddNew,
  updatingId,
}) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-[24px] bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
          <FolderTree className="h-8 w-8" />
        </div>
        <h3 className="text-base font-bold text-zinc-900 mb-1">
          No categories found
        </h3>
        <p className="text-xs text-zinc-500 max-w-sm mb-5">
          Get started by creating your first product category. Categories help vendors classify plants, seeds, and care products.
        </p>
        <Button
          type="button"
          onClick={onAddNew}
          className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Category</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      {categories.map((category) => {
        const isUpdating = updatingId === category.id;
        const formattedDate = category.created_at
          ? new Date(category.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recently";

        return (
          <div
            key={category.id}
            className={`group flex flex-col justify-between rounded-[24px] bg-white border border-black/[0.05] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_32px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 ${
              !category.is_active ? "opacity-85 bg-zinc-50/50" : ""
            }`}
          >
            {/* Top Row: Icon, Title & Status */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 ${
                      category.is_active
                        ? "bg-gradient-to-br from-emerald-50 to-teal-100/60 text-emerald-700 shadow-xs"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    <FolderTree className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-zinc-900 tracking-tight truncate group-hover:text-emerald-800 transition-colors">
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 mt-0.5 truncate">
                      <Hash className="h-3 w-3 shrink-0 text-zinc-400" />
                      <span className="truncate">{category.slug || "slug-pending"}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                    category.is_active
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-zinc-100 text-zinc-500 border-zinc-200"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      category.is_active ? "bg-emerald-500" : "bg-zinc-400"
                    }`}
                  />
                  {category.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3 mb-4 min-h-[42px]">
                {category.description || (
                  <span className="italic text-zinc-400">
                    No description provided for this department.
                  </span>
                )}
              </p>
            </div>

            {/* Bottom Meta & Action Bar */}
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2 mt-auto">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </div>

              <div className="flex items-center gap-1">
                {/* Status Toggle Button */}
                <button
                  type="button"
                  title={category.is_active ? "Deactivate Category" : "Activate Category"}
                  disabled={isUpdating}
                  onClick={() => onToggleStatus(category.id, category.is_active)}
                  className={`p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    category.is_active
                      ? "text-zinc-400 hover:text-amber-600 hover:bg-amber-50"
                      : "text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  <Power className="h-4 w-4" />
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  title="Edit Category Details"
                  onClick={() => onEdit(category)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <Edit2 className="h-4 w-4" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  title="Delete Category"
                  onClick={() => onDelete(category)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
