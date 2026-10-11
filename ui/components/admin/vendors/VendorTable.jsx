"use client";

import React from "react";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LeafSpinner } from "@/components/common/GlobalLoader";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import VendorTableRow from "./VendorTableRow";

export default function VendorTable({
  vendors = [],
  displayVendors = [],
  isLoading = false,
  searchQuery = "",
  onStatusUpdate,
  onRejectRequest,
  onViewDetails,
  updatingId = null,
}) {
  return (
    <Card className="rounded-[28px] border border-black/[0.04] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
      {/* Loading State */}
      {isLoading && vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <LeafSpinner size="md" className="mb-4" />
          <p className="text-sm font-semibold text-zinc-800">
            Loading vendors...
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Please wait while we fetch the latest vendor records.
          </p>
        </div>
      ) : displayVendors.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 mb-3">
            <Users className="h-6 w-6" />
          </div>

          <p className="text-sm font-semibold text-zinc-800">
            No vendors found
          </p>

          <p className="text-xs text-zinc-500 mt-0.5">
            {searchQuery
              ? `No vendor records match "${searchQuery}".`
              : "There are currently no vendor records to show."}
          </p>
        </div>
      ) : (
        /* Vendors Table */
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-zinc-200 bg-zinc-50/60 hover:bg-zinc-50/60">
                <TableHead className="w-[30%] text-zinc-600 font-semibold">
                  Vendor
                </TableHead>

                <TableHead className="w-[25%] text-zinc-600 font-semibold">
                  Contact
                </TableHead>

                <TableHead className="w-[15%] text-zinc-600 font-semibold">
                  Location
                </TableHead>

                <TableHead className="w-[15%] text-zinc-600 font-semibold">
                  Status
                </TableHead>

                <TableHead className="w-[15%] text-right text-zinc-600 font-semibold pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {displayVendors.map((vendor) => (
                <VendorTableRow
                  key={vendor.id}
                  vendor={vendor}
                  onStatusUpdate={onStatusUpdate}
                  onRejectRequest={onRejectRequest}
                  onViewDetails={onViewDetails}
                  isUpdating={updatingId === vendor.id}
                />
              ))}
            </TableBody>
          </Table>

          {/* Table Footer */}
          <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50/50 px-6 py-3">
            <p className="text-xs text-zinc-500">
              Showing{" "}
              <span className="font-semibold text-zinc-700">
                {displayVendors.length}
              </span>{" "}
              of {vendors.length} vendors
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
