"use client";

import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  MoreHorizontal,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig = {
  pending: {
    label: "Pending",
    variant: "secondary",
    className:
      "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
    icon: <Clock className="h-3 w-3" />,
    dotColor: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    variant: "outline",
    className:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
    icon: <CheckCircle2 className="h-3 w-3" />,
    dotColor: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    className:
      "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
    icon: <XCircle className="h-3 w-3" />,
    dotColor: "bg-red-500",
  },
};

export default function VendorTableRow({ vendor, onStatusUpdate, isUpdating }) {
  const statusInfo = statusConfig[vendor.status] || statusConfig.pending;
  const isPending = vendor.status === "pending";

  const getInitials = (v) => {
    const f = v.first_name?.[0] || "";
    const l = v.last_name?.[0] || "";
    return (f + l).toUpperCase() || (v.company_name?.[0] || "V").toUpperCase();
  };

  return (
    <TableRow className="border-b border-zinc-100 hover:bg-zinc-50/60 transition-colors">
      {/* Vendor Profile Info */}
      <TableCell className="py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-white shadow-xs">
            {getInitials(vendor)}
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-zinc-900 text-sm truncate">
              {vendor.first_name || ""} {vendor.last_name || ""}
            </p>

            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
              <Building2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{vendor.company_name}</span>
            </div>
          </div>
        </div>
      </TableCell>

      {/* Contact Details */}
      <TableCell className="py-3.5">
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-700">
            <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{vendor.email}</span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-500">
            <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span>{vendor.phone_number || "—"}</span>
          </div>
        </div>
      </TableCell>

      {/* City Location */}
      <TableCell className="py-3.5">
        <div className="flex items-center gap-1.5 text-xs text-zinc-700">
          <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <span>{vendor.city || "—"}</span>
        </div>
      </TableCell>

      {/* Status Badge */}
      <TableCell className="py-3.5">
        <Badge
          variant={statusInfo.variant}
          className={`${statusInfo.className} inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotColor}`} />
          {statusInfo.label}
        </Badge>
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3.5 text-right pr-6">
        <div className="flex items-center justify-end gap-2">
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
          ) : isPending ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusUpdate(vendor.id, "approved")}
                className="h-8 px-2.5 rounded-lg border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Approve</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusUpdate(vendor.id, "rejected")}
                className="h-8 px-2.5 rounded-lg border-red-300 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reject</span>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 rounded-lg border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium gap-1 cursor-pointer"
                >
                  <span>Action</span>
                  <MoreHorizontal className="h-3.5 w-3.5 text-zinc-500" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-48 rounded-xl p-1.5 shadow-md border border-zinc-200 bg-white"
              >
                {vendor.status === "approved" && (
                  <DropdownMenuItem
                    onClick={() => onStatusUpdate(vendor.id, "rejected")}
                    className="cursor-pointer gap-2 text-xs font-medium text-red-600 hover:bg-red-50 focus:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span>Set Inactive (Reject)</span>
                  </DropdownMenuItem>
                )}

                {vendor.status !== "approved" && (
                  <DropdownMenuItem
                    onClick={() => onStatusUpdate(vendor.id, "approved")}
                    className="cursor-pointer gap-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 focus:bg-emerald-50"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Set Active (Approve)</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
