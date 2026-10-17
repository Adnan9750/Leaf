"use client";

import React from "react";
import { FolderTree, CheckCircle2, EyeOff, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function CategoryStats({ stats }) {
  const statCards = [
    {
      key: "total",
      label: "Total Categories",
      value: stats?.total ?? 0,
      subtext: "Marketplace departments",
      icon: FolderTree,
      textColor: "text-zinc-900",
      iconBg: "bg-emerald-50 text-emerald-700",
    },
    {
      key: "active",
      label: "Active Categories",
      value: stats?.active ?? 0,
      subtext: "Visible for vendor products",
      icon: CheckCircle2,
      textColor: "text-emerald-700",
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      key: "inactive",
      label: "Inactive Categories",
      value: stats?.inactive ?? 0,
      subtext: "Hidden from store browsing",
      icon: EyeOff,
      textColor: "text-amber-600",
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      key: "latest",
      label: "Latest Addition",
      value: stats?.latestName || "None",
      subtext: stats?.latestDate ? `Added ${stats.latestDate}` : "No categories yet",
      icon: Sparkles,
      textColor: "text-zinc-900 text-base sm:text-lg truncate",
      iconBg: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.key}
            className="p-4 sm:p-5 rounded-[22px] border border-black/[0.04] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  {card.label}
                </p>
                <p className={`text-xl sm:text-2xl font-extrabold ${card.textColor}`}>
                  {card.value}
                </p>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 truncate">
                  {card.subtext}
                </p>
              </div>

              <div
                className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
