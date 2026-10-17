"use client";

import React from "react";
import { Search, X, LayoutGrid, List } from "lucide-react";

const filterTabs = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

export default function CategoryFilters({
  filter,
  setFilter,
  stats,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  totalCount,
}) {
  const currentCount = totalCount ?? stats?.total ?? 0;

  return (
    <div className="space-y-3">
      {/* Top Row: Status Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 rounded-2xl bg-white border border-black/[0.04] p-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-x-auto">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.key;
            const count =
              tab.key === "all"
                ? stats?.total ?? 0
                : tab.key === "active"
                  ? stats?.active ?? 0
                  : stats?.inactive ?? 0;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? "bg-canopy text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`inline-flex h-4 min-w-[16px] items-center justify-center rounded-full text-[10px] font-bold px-1.5 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full sm:w-72 md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories or slug..."
            className="w-full h-10 pl-10 pr-9 rounded-2xl border border-black/[0.04] bg-white text-xs font-medium text-zinc-800 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* New Row: View Mode Switcher placed below search bar, with results count */}
      <div className="flex items-center justify-between gap-3 pt-0.5">
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>
            Showing <span className="font-bold text-zinc-800">{currentCount}</span>{" "}
            {currentCount === 1 ? "category" : "categories"}
          </span>
          {searchQuery && (
            <span className="hidden sm:inline-flex items-center text-zinc-400 text-[11px]">
              matching &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        {/* View Mode Toggle (Cards vs Table) */}
        <div className="flex items-center rounded-2xl bg-white border border-black/[0.04] p-1 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            title="Card View"
            aria-label="Card View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "cards"
                ? "bg-canopy text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="text-xs">Cards</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("table")}
            title="Table View"
            aria-label="Table View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-canopy text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span className="text-xs">Table</span>
          </button>
        </div>
      </div>
    </div>
  );
}
