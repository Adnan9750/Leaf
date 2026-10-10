"use client";

import React from "react";
import { Users, Timer, ShieldCheck, ShieldX } from "lucide-react";
import { Card } from "@/components/ui/card";

const statCards = [
  {
    key: "total",
    label: "Total Vendors",
    icon: Users,
    bg: "bg-white",
    textColor: "text-zinc-900",
    iconBg: "bg-zinc-100 text-zinc-700",
  },
  {
    key: "pending",
    label: "Pending Review",
    icon: Timer,
    bg: "bg-white",
    textColor: "text-amber-600",
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    key: "approved",
    label: "Approved",
    icon: ShieldCheck,
    bg: "bg-white",
    textColor: "text-emerald-600",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: ShieldX,
    bg: "bg-white",
    textColor: "text-red-600",
    iconBg: "bg-red-50 text-red-600",
  },
];

export default function VendorStats({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key] ?? 0;

        return (
          <Card
            key={card.key}
            className={`p-5 rounded-xl border-none ${card.bg} shadow-xs`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 mb-1">
                  {card.label}
                </p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {value}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
