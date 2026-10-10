"use client";

import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

export default function VendorTableRow({
  vendor,
  onStatusUpdate,
  onRejectRequest,
  onViewDetails,
  isUpdating,
}) {
  const statusInfo = statusConfig[vendor.status] || statusConfig.pending;

  const getInitials = (v) => {
    const f = v.first_name?.[0] || "";
    const l = v.last_name?.[0] || "";
    return (f + l).toUpperCase() || (v.company_name?.[0] || "V").toUpperCase();
  };

  const handleRejectClick = () => {
    if (onRejectRequest) {
      onRejectRequest(vendor);
    } else {
      onStatusUpdate(vendor.id, "rejected");
    }
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
        <div className="space-y-1">
          <Badge
            variant={statusInfo.variant}
            className={`${statusInfo.className} inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotColor}`} />
            {statusInfo.label}
          </Badge>
          {vendor.status === "rejected" && vendor.rejection_reason && (
            <p
              className="text-[11px] text-red-600 max-w-[180px] truncate"
              title={`Reason: ${vendor.rejection_reason}`}
            >
              Reason: {vendor.rejection_reason}
            </p>
          )}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3.5 text-right pr-6">
        <div className="inline-flex items-center justify-end gap-1.5">
          {isUpdating ? (
            <div className="h-8 w-8 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            </div>
          ) : (
            <>
              {/* Quick View Action */}
              {/* <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails?.(vendor)}
                className="h-8 w-8 p-0 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-all active:scale-95 cursor-pointer"
                title="View full details"
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View vendor details</span>
              </Button> */}

              {/* Action Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 data-[state=open]:bg-zinc-100 data-[state=open]:text-zinc-900 transition-all active:scale-95 cursor-pointer"
                    title="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-44 rounded-xl p-1.5 shadow-xl border border-zinc-200/90 bg-white/95 backdrop-blur-sm"
                >
                  <DropdownMenuItem
                    onClick={() => onViewDetails?.(vendor)}
                    className="cursor-pointer gap-2.5 px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5 text-zinc-400" />
                    <span>View Details</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 bg-zinc-100" />

                  {vendor.status !== "approved" && (
                    <DropdownMenuItem
                      onClick={() => onStatusUpdate(vendor.id, "approved")}
                      className="cursor-pointer gap-2.5 px-2.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Accept</span>
                    </DropdownMenuItem>
                  )}

                  {vendor.status !== "rejected" && (
                    <DropdownMenuItem
                      onClick={handleRejectClick}
                      className="cursor-pointer gap-2.5 px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                    >
                      <XCircle className="h-3.5 w-3.5 text-red-500" />
                      <span>Reject</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
