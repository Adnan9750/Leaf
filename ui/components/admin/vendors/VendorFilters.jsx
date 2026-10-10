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
      <div className="flex items-center gap-1 rounded-xl bg-zinc-100/80 border border-zinc-200/80 p-1 self-start overflow-x-auto max-w-full">
        {filterTabs.map((tab) => {
          const isActive = filter === tab.key;
          const count = stats?.[tab.key] ?? 0;

          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white text-zinc-900 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {tab.label}

              {tab.key !== "" && (
                <span
                  className={`ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full text-[10px] font-bold px-1.5 ${
                    isActive
                      ? "bg-zinc-100 text-zinc-800"
                      : "bg-zinc-200/60 text-zinc-500"
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vendors..."
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 shadow-xs transition-all"
        />
      </div>
    </div>
  );
}
