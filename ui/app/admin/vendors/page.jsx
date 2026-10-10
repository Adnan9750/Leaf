"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVendorStore } from "@/store/vendorStore";

import VendorHeader from "@/components/admin/vendors/VendorHeader";
import VendorStats from "@/components/admin/vendors/VendorStats";
import VendorFilters from "@/components/admin/vendors/VendorFilters";
import VendorTable from "@/components/admin/vendors/VendorTable";

export default function VendorListPage() {
  const { vendors, isLoading, error, fetchVendors, updateVendorStatus } =
    useVendorStore();
  const [filter, setFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchVendors("all");
  }, [fetchVendors]);

  const handleStatusUpdate = async (vendorId, status) => {
    setUpdatingId(vendorId);
    await updateVendorStatus(vendorId, status);
    setUpdatingId(null);
  };

  const stats = useMemo(() => {
    const total = vendors.length;
    const pending = vendors.filter((v) => v.status === "pending").length;
    const approved = vendors.filter((v) => v.status === "approved").length;
    const rejected = vendors.filter((v) => v.status === "rejected").length;

    return { total, pending, approved, rejected };
  }, [vendors]);

  const displayVendors = useMemo(() => {
    let list = filter ? vendors.filter((v) => v.status === filter) : vendors;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      list = list.filter(
        (v) =>
          (v.first_name || "").toLowerCase().includes(q) ||
          (v.last_name || "").toLowerCase().includes(q) ||
          (v.company_name || "").toLowerCase().includes(q) ||
          (v.email || "").toLowerCase().includes(q) ||
          (v.city || "").toLowerCase().includes(q) ||
          (v.phone_number || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [vendors, filter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Refresh */}
      <VendorHeader
        isLoading={isLoading}
        onRefresh={() => fetchVendors("all", true)}
      />

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchVendors("all")}
            className="h-7 text-xs px-2 border-red-300 text-red-700 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 4 Metric Stat Cards */}
      <VendorStats stats={stats} />

      {/* Status Filter Tabs & Instant Search */}
      <VendorFilters
        filter={filter}
        setFilter={setFilter}
        stats={stats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Data Table, Empty & Loading States */}
      <VendorTable
        vendors={vendors}
        displayVendors={displayVendors}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onStatusUpdate={handleStatusUpdate}
        updatingId={updatingId}
      />
    </div>
  );
}