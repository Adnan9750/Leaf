"use client";

import React from "react";
import {
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wallet,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  pending: {
    label: "Pending Review",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock className="h-3.5 w-3.5" />,
    dotColor: "bg-amber-500",
  },
  approved: {
    label: "Approved & Active",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    dotColor: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: <XCircle className="h-3.5 w-3.5" />,
    dotColor: "bg-red-500",
  },
};

export default function VendorDetailsModal({
  isOpen,
  vendor,
  onClose,
  onAccept,
  onReject,
}) {
  if (!isOpen || !vendor) return null;

  const statusInfo = statusConfig[vendor.status] || statusConfig.pending;

  const getInitials = (v) => {
    const f = v.first_name?.[0] || "";
    const l = v.last_name?.[0] || "";
    return (f + l).toUpperCase() || (v.company_name?.[0] || "V").toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="relative bg-zinc-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md">
              {getInitials(vendor)}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate">
                {vendor.company_name}
              </h3>
              <p className="text-xs text-zinc-300 mt-0.5 truncate">
                {vendor.first_name || ""} {vendor.last_name || ""} &bull;{" "}
                <span className="text-zinc-400">{vendor.email}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-zinc-700">
          {/* Status Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200">
            <span className="font-semibold text-zinc-600">Application Status</span>
            <Badge
              variant="outline"
              className={`${statusInfo.className} inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border`}
            >
              <span className={`h-2 w-2 rounded-full ${statusInfo.dotColor}`} />
              {statusInfo.label}
            </Badge>
          </div>

          {/* Rejection Reason Alert if rejected */}
          {vendor.status === "rejected" && vendor.rejection_reason && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800">
              <div className="flex items-center gap-1.5 font-bold text-red-900 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <span>Rejection Reason</span>
              </div>
              <p className="text-xs text-red-700 whitespace-pre-wrap pl-5">
                {vendor.rejection_reason}
              </p>
            </div>
          )}

          {/* Contact Details Grid */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl border border-zinc-200 bg-white space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium">
                  <User className="h-3.5 w-3.5" />
                  <span>Contact Person</span>
                </div>
                <p className="font-semibold text-zinc-900">
                  {vendor.first_name || "—"} {vendor.last_name || ""}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 bg-white space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email Address</span>
                </div>
                <p className="font-semibold text-zinc-900 truncate">
                  {vendor.email || "—"}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 bg-white space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium">
                  <Phone className="h-3.5 w-3.5" />
                  <span>Phone Number</span>
                </div>
                <p className="font-semibold text-zinc-900">
                  {vendor.phone_number || "—"}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 bg-white space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium">
                  <Wallet className="h-3.5 w-3.5" />
                  <span>Currency</span>
                </div>
                <p className="font-semibold text-zinc-900">
                  {vendor.currency || "PKR"}
                </p>
              </div>
            </div>
          </div>

          {/* Location & Address */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
              Location & Address
            </h4>
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl border border-zinc-200 bg-white space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>City</span>
                </div>
                <p className="font-semibold text-zinc-900">
                  {vendor.city || "—"}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 bg-white space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Full Physical Address</span>
                </div>
                <p className="font-medium text-zinc-800 whitespace-pre-wrap">
                  {vendor.address || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
              Account Timeline
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/70 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Registered Date</span>
                </div>
                <p className="font-semibold text-zinc-800">
                  {formatDate(vendor.created_at)}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/70 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Last Updated</span>
                </div>
                <p className="font-semibold text-zinc-800">
                  {formatDate(vendor.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-zinc-200 bg-zinc-50/80">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 rounded-xl border-zinc-200 text-zinc-700 text-xs font-medium cursor-pointer"
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            {vendor.status !== "approved" && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onClose();
                  onAccept?.(vendor.id);
                }}
                className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Accept</span>
              </Button>
            )}

            {vendor.status !== "rejected" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  onClose();
                  onReject?.(vendor);
                }}
                className="h-9 px-4 rounded-xl border-red-300 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
