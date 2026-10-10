"use client";

import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RejectVendorModal({
  isOpen,
  vendor,
  onClose,
  onConfirm,
  isSubmitting = false,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason(vendor?.rejection_reason || "");
      setError("");
    }
  }, [isOpen, vendor]);

  if (!isOpen || !vendor) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for rejecting this vendor application.");
      return;
    }
    onConfirm(vendor.id, reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Reject Vendor Application
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {vendor.company_name} ({vendor.email})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Reason Textarea */}
          <div>
            <label
              htmlFor="rejection-reason"
              className="block text-xs font-semibold text-zinc-700 mb-1"
            >
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="rejection-reason"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder="Provide a clear explanation why the application is being rejected..."
              className={`w-full rounded-xl border p-3 text-xs outline-none transition-all placeholder:text-zinc-400 ${
                error
                  ? "border-red-400 ring-2 ring-red-100"
                  : "border-zinc-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              }`}
            />
            {error && (
              <p className="mt-1 text-[11px] font-medium text-red-600">
                {error}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 px-4 rounded-xl border-zinc-200 text-zinc-700 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Sending..." : "Reject & Send Email"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
