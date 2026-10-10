"use client";

import React from "react";
import { RotateCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLoaderStore } from "@/store/loaderStore";

export default function VendorHeader({ isLoading, onRefresh }) {
  const { showLoader, hideLoader } = useLoaderStore();

  const handlePreviewLoader = () => {
    showLoader("Previewing LeafLens Global Loader...");
    setTimeout(() => {
      hideLoader();
    }, 3000);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Vendors
        </h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Review and manage vendor account registrations.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviewLoader}
          className="h-9 px-3 gap-2 text-xs font-semibold text-fern bg-fern/10 border-fern/30 hover:bg-fern/20 shadow-xs cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Preview Loader</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-9 px-3 gap-2 text-xs font-semibold text-zinc-700 bg-white border-zinc-200 hover:bg-zinc-50 shadow-xs cursor-pointer"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>
    </div>
  );
}
