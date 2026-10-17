"use client";

import React from "react";
import { Plus, RotateCw, ShieldCheck, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CategoryHeader({ isLoading, onRefresh, onAddNew }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
            <FolderTree className="h-4 w-4" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight font-display">
            Categories
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-500">
          Organize marketplace catalog taxonomy, departments, and product classifications.
        </p>
      </div>

      <div className="flex items-center gap-2.5 self-start sm:self-auto">
        <Button
          type="button"
          onClick={onAddNew}
          className="h-10 px-4 rounded-xl bg-canopy text-white text-xs font-semibold gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer transition-all hover:scale-[1.01]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </div>
    </div>
  );
}
