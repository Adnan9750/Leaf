"use client";

import React from "react";
import { Search } from "lucide-react";

const filterTabs = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function VendorFilters({
  filter,
  setFilter,
  stats,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 rounded-2xl bg-white border border-black/[0.04] p-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] self-start overflow-x-auto max-w-full">
        {filterTabs.map((tab) => {
          const isActive = filter === tab.key;
          const count = stats?.[tab.key] ?? 0;

          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${isActive
                ? "bg-[#135A33] text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
            >
              {tab.label}

              {tab.key !== "" && (
                <span
                  className={`ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full text-[10px] font-bold px-1.5 ${isActive
                    ? "bg-white/20 text-white"
                    : "bg-zinc-100 text-zinc-600"
                    }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vendors..."
          className="w-full h-11 pl-10 pr-3.5 rounded-2xl border border-black/[0.04] bg-white text-xs font-medium text-zinc-800 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all"
        />
      </div>
    </div>
  );
}
