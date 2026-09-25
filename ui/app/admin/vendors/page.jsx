"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  ShieldCheck,
  ShieldX,
  Timer,
  Mail,
  Phone,
  MapPin,
  Building2,
  Search,
  RefreshCw,
  MoreHorizontal,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminApi } from "@/lib/api/admin";

/* ── Status visual config ── */
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
    className: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
    icon: <XCircle className="h-3 w-3" />,
    dotColor: "bg-red-500",
  },
};

/* ── Stat card definitions ── */
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

/* ── Filter tabs ── */
const filterTabs = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function VendorListPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listVendors();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to fetch vendors."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleStatusUpdate = async (vendorId, status) => {
    setActionLoading(vendorId);
    setError(null);
    try {
      await adminApi.updateVendorStatus(vendorId, { status });
      await fetchVendors();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to update vendor status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Computed stats ── */
  const stats = useMemo(() => {
    const total = vendors.length;
    const pending = vendors.filter((v) => v.status === "pending").length;
    const approved = vendors.filter((v) => v.status === "approved").length;
    const rejected = vendors.filter((v) => v.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [vendors]);

  /* ── Filtered and searched vendors ── */
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
          (v.city && v.city.toLowerCase().includes(q))
      );
    }
    return list;
  }, [vendors, filter, searchQuery]);

  /* ── Vendor initials helper ── */
  const getInitials = (v) => {
    const f = v.first_name?.[0] || "";
    const l = v.last_name?.[0] || "";
    const initials = (f + l).toUpperCase();
    return initials || (v.company_name?.[0] || "V").toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Vendors
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Review and manage vendor account registrations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchVendors}
          disabled={loading}
          className="self-start sm:self-auto rounded-lg border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 shadow-sm cursor-pointer gap-2"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-zinc-500 ${loading ? "animate-spin" : ""
              }`}
          />
          <span>Refresh</span>
        </Button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key];
          return (
            <Card
              key={card.key}
              className={`p-5 rounded-xl border border-zinc-200/70 ${card.bg} shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 mb-1">
                    {card.label}
                  </p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>
                    {loading ? "—" : value}
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

      {/* ── Filter Tabs & Search Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-zinc-100/80 border border-zinc-200/80 p-1 self-start">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${filter === tab.key
                  ? "bg-white text-zinc-900 font-semibold shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
                }`}
            >
              {tab.label}
              {!loading && tab.key !== "" && (
                <span
                  className={`ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full text-[10px] font-bold px-1.5 ${filter === tab.key
                      ? "bg-zinc-100 text-zinc-800"
                      : "bg-zinc-200/60 text-zinc-500"
                    }`}
                >
                  {stats[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Real-time search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendors..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Shadcn Table Section ── */}
      <Card className="rounded-xl border border-zinc-200/70 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
            </div>
            <p className="mt-3 text-xs font-medium text-zinc-500">
              Loading vendor list...
            </p>
          </div>
        ) : displayVendors.length === 0 ? (
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-zinc-200 bg-zinc-50/60 hover:bg-zinc-50/60">
                  <TableHead className="w-[30%] text-zinc-600 font-semibold pl-6">
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
                {displayVendors.map((vendor) => {
                  const statusInfo = statusConfig[vendor.status] || {
                    label: vendor.status || "Unknown",
                    variant: "outline",
                    className: "bg-zinc-50 text-zinc-700 border border-zinc-200",
                    dotColor: "bg-zinc-500",
                  };
                  const isPending = vendor.status === "pending";
                  const isActionLoading = actionLoading === vendor.id;

                  return (
                    <TableRow
                      key={vendor.id}
                      className="border-b border-zinc-100 hover:bg-zinc-50/60 transition-colors"
                    >
                      {/* Vendor Info */}
                      <TableCell className="py-3.5 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white shadow-sm">
                            {getInitials(vendor)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900 text-sm truncate">
                              {vendor.first_name || ""} {vendor.last_name || ""}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                              <Building2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              <span className="truncate">
                                {vendor.company_name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact Info */}
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

                      {/* Location */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-700">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span>{vendor.city || "—"}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5">
                        <Badge
                          variant={statusInfo.variant}
                          className={`${statusInfo.className} inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotColor}`}
                          />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell className="py-3.5 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {isPending ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusUpdate(vendor.id, "approved")
                                }
                                disabled={isActionLoading}
                                className="h-8 px-2.5 rounded-lg border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold gap-1.5 cursor-pointer"
                              >
                                {isActionLoading ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Approve</span>
                                  </>
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusUpdate(vendor.id, "rejected")
                                }
                                disabled={isActionLoading}
                                className="h-8 px-2.5 rounded-lg border-red-300 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-semibold gap-1.5 cursor-pointer"
                              >
                                {isActionLoading ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <X className="h-3.5 w-3.5" />
                                    <span>Reject</span>
                                  </>
                                )}
                              </Button>
                            </>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isActionLoading}
                                  className="h-8 px-2.5 rounded-lg border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium gap-1 cursor-pointer"
                                >
                                  {isActionLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-600" />
                                  ) : (
                                    <>
                                      <span>Action</span>
                                      <MoreHorizontal className="h-3.5 w-3.5 text-zinc-500" />
                                    </>
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 rounded-xl p-1.5 shadow-md border border-zinc-200 bg-white"
                              >
                                {vendor.status === "approved" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusUpdate(vendor.id, "rejected")
                                    }
                                    className="cursor-pointer gap-2 text-xs font-medium text-red-600 hover:bg-red-50 focus:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span>Set Inactive / Rejected</span>
                                  </DropdownMenuItem>
                                )}
                                {vendor.status !== "approved" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusUpdate(vendor.id, "approved")
                                    }
                                    className="cursor-pointer gap-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 focus:bg-emerald-50"
                                  >
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <span>Set Active / Approved</span>
                                  </DropdownMenuItem>
                                )}
                                {vendor.status !== "pending" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusUpdate(vendor.id, "pending")
                                    }
                                    className="cursor-pointer gap-2 text-xs font-medium text-amber-700 hover:bg-amber-50 focus:bg-amber-50"
                                  >
                                    <RotateCcw className="h-4 w-4 text-amber-600" />
                                    <span>Revert to Pending</span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Table Footer Stats */}
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
    </div>
  );
}
