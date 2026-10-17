"use client";

import React from "react";
import {
  FolderTree,
  Calendar,
  Edit2,
  Trash2,
  Power,
  Hash,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CategoryTableView({
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
          Get started by creating your first product category.
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
    <div className="overflow-hidden rounded-[24px] bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/70 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-5">Category & Slug</th>
              <th className="py-3.5 px-5">Description</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Created</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-medium">
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
                <tr
                  key={category.id}
                  className="hover:bg-zinc-50/80 transition-colors group"
                >
                  {/* Category Name & Slug */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                          category.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        <FolderTree className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-900 group-hover:text-emerald-800 transition-colors">
                          {category.name}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                          <Hash className="h-3 w-3 shrink-0" />
                          <span>{category.slug || "slug-pending"}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-5 max-w-xs">
                    <p className="text-zinc-600 line-clamp-2">
                      {category.description || (
                        <span className="italic text-zinc-400">None</span>
                      )}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
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
                  </td>

                  {/* Created At */}
                  <td className="py-3.5 px-5 text-zinc-500 text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{formattedDate}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* Toggle status */}
                      <button
                        type="button"
                        title={
                          category.is_active ? "Deactivate Category" : "Activate Category"
                        }
                        disabled={isUpdating}
                        onClick={() => onToggleStatus(category.id, category.is_active)}
                        className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          category.is_active
                            ? "text-zinc-400 hover:text-amber-600 hover:bg-amber-50"
                            : "text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        <Power className="h-4 w-4" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        title="Edit Category Details"
                        onClick={() => onEdit(category)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        title="Delete Category"
                        onClick={() => onDelete(category)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
