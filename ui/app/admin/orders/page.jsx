"use client";

import React, { useEffect, useState, useMemo, useSyncExternalStore, useCallback } from "react";
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Search,
  RotateCcw,
  Eye,
  User,
  Phone,
  Mail,
  MapPin,
  Store,
  Leaf,
  Calendar,
  X,
  Loader2,
  Package,
  Layers,
  Banknote,
  Building2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useAdminOrderStore } from "@/store/adminOrderStore";
import { useVendorStore } from "@/store/vendorStore";
import { getProductImageUrl } from "@/components/products/ProductCard";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function fmtPrice(val) {
  if (val == null || val === "") return "PKR 0";
  const num = Number(val);
  if (!Number.isFinite(num)) return `PKR ${val}`;
  return `PKR ${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(isoStr) {
  if (!isoStr) return "—";
  try {
    return new Date(isoStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoStr;
  }
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-amber-50 text-amber-700 border-amber-200/80",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "bg-blue-50 text-blue-700 border-blue-200/80",
    dot: "bg-blue-500",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    dot: "bg-indigo-500",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-50 text-red-700 border-red-200/80",
    dot: "bg-red-500",
  },
};

export default function AdminOrdersPage() {
  const mounted = useMounted();
  const user = useAuthStore((state) => state.user);

  const isSuperAdmin = mounted
    ? Boolean(user?.is_superuser || user?.role === "admin" || user?.is_staff)
    : false;

  const {
    orders,
    stats,
    isLoading,
    isUpdating,
    error,
    statusFilter,
    searchQuery,
    vendorFilter,
    setStatusFilter,
    setSearchQuery,
    setVendorFilter,
    fetchOrders,
    updateOrderStatus,
  } = useAdminOrderStore();

  const { vendors, fetchVendors } = useVendorStore();

  const [activeModalOrder, setActiveModalOrder] = useState(null);
  const [modalStatus, setModalStatus] = useState("");
  const [modalNotes, setModalNotes] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // If superadmin, fetch vendors list for filter dropdown
  useEffect(() => {
    if (isSuperAdmin) {
      fetchVendors("all");
    }
  }, [isSuperAdmin, fetchVendors]);

  // Handle Search Input Change with debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
  };

  const handleApplyFilter = useCallback(
    (newStatus, newVendor) => {
      fetchOrders({
        status: newStatus !== undefined ? newStatus : statusFilter,
        vendor_id: newVendor !== undefined ? newVendor : vendorFilter,
      });
    },
    [fetchOrders, statusFilter, vendorFilter]
  );

  // Status Tab selection
  const handleStatusTabClick = (statusKey) => {
    setStatusFilter(statusKey);
    handleApplyFilter(statusKey, undefined);
  };

  // Vendor Filter selection (Superadmin only)
  const handleVendorChange = (e) => {
    const vId = e.target.value;
    setVendorFilter(vId);
    handleApplyFilter(undefined, vId);
  };

  // Open Details Modal
  const openDetails = (order) => {
    setActiveModalOrder(order);
    setModalStatus(order.status);
    setModalNotes(order.notes || "");
    setActionSuccessMsg("");
  };

  const closeDetails = () => {
    setActiveModalOrder(null);
    setActionSuccessMsg("");
  };

  // Update Status in Modal
  const handleStatusUpdate = async () => {
    if (!activeModalOrder) return;
    const res = await updateOrderStatus(activeModalOrder.id, modalStatus, modalNotes);
    if (res.success) {
      setActiveModalOrder((prev) => (prev ? { ...prev, status: modalStatus, notes: modalNotes } : null));
      setActionSuccessMsg(`Order status updated to ${modalStatus.toUpperCase()}`);
      setTimeout(() => setActionSuccessMsg(""), 4000);
    }
  };

  // Filter display orders client-side if user types quickly
  const displayedOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter(
      (o) =>
        String(o.id).includes(q) ||
        o.full_name?.toLowerCase().includes(q) ||
        o.phone?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q) ||
        o.address?.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  if (!mounted) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-zinc-200 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-[28px] p-5 sm:p-6 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                isSuperAdmin
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}
            >
              {isSuperAdmin ? (
                <>
                  <Building2 className="w-3.5 h-3.5" /> Platform Admin
                </>
              ) : (
                <>
                  <Store className="w-3.5 h-3.5" /> Vendor Portal
                </>
              )}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {isSuperAdmin ? "Global Marketplace Scope" : "Store-Specific Orders"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-zinc-900 tracking-tight mt-1.5">
            {isSuperAdmin ? "Marketplace Orders" : "Orders"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            {isSuperAdmin
              ? "Monitor and manage orders placed across all registered vendors."
              : "Review and fulfill customer orders containing products from your store."}
          </p>
        </div>

        {/* Action Controls */}
        {/* <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders()}
            disabled={isLoading}
            className="rounded-2xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-semibold gap-1.5 h-10 px-4"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div> */}
      </div>

      {/* ── KPI Stats Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/[0.04] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Orders
            </p>
            <p className="text-2xl sm:text-3xl font-display font-bold text-zinc-900">
              {stats.total_orders || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/[0.04] shadow-xs flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider truncate">
              {isSuperAdmin ? "Total Volume" : "Store Revenue"}
            </p>
            <p className="text-lg sm:text-xl font-display font-bold text-emerald-600 truncate">
              {fmtPrice(stats.total_revenue || 0)}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/[0.04] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Pending
            </p>
            <p className="text-2xl sm:text-3xl font-display font-bold text-amber-700">
              {stats.pending || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Shipped / In Transit */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/[0.04] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              In Transit
            </p>
            <p className="text-2xl sm:text-3xl font-display font-bold text-indigo-700">
              {stats.shipped || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Delivered */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/[0.04] shadow-xs flex items-center justify-between col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Delivered
            </p>
            <p className="text-2xl sm:text-3xl font-display font-bold text-emerald-700">
              {stats.delivered || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ────────────────────────────────────────────── */}
      <div className="bg-white rounded-[28px] p-4 sm:p-5 border border-black/[0.04] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by order #, customer name, phone, address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-200 bg-zinc-50/70 text-xs sm:text-sm text-zinc-800 placeholder:text-zinc-400 outline-none transition focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Superadmin Vendor Filter Dropdown */}
          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500 shrink-0">
                Filter Vendor:
              </span>
              <select
                value={vendorFilter}
                onChange={handleVendorChange}
                className="px-3.5 py-2.5 rounded-2xl border border-zinc-200 bg-zinc-50/80 text-xs font-semibold text-zinc-800 outline-none transition focus:bg-white focus:border-emerald-500"
              >
                <option value="all">All Vendors</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.company_name} ({v.user?.first_name || "Vendor"})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: "all", label: "All Orders", count: stats.total_orders },
            { key: "pending", label: "Pending", count: stats.pending },
            { key: "confirmed", label: "Confirmed", count: stats.confirmed },
            { key: "shipped", label: "Shipped", count: stats.shipped },
            { key: "delivered", label: "Delivered", count: stats.delivered },
            { key: "cancelled", label: "Cancelled", count: stats.cancelled },
          ].map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleStatusTabClick(tab.key)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count != null && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Error Banner ───────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Orders Table / List View ───────────────────────────────────────────── */}
      <div className="bg-white rounded-[28px] border border-black/[0.04] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-xs font-semibold">Loading orders...</p>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="py-20 text-center space-y-3 px-4">
            <div className="w-16 h-16 rounded-3xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="font-display font-bold text-zinc-800 text-lg">No Orders Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {searchQuery
                ? `No orders matching "${searchQuery}". Try a different search keyword.`
                : statusFilter !== "all"
                ? `There are no orders with status "${statusFilter}".`
                : "No customer orders have been received yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {/* <th className="py-3.5 px-5">Order ID</th> */}
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Products / Items</th>
                  <th className="py-3.5 px-5">Destination</th>
                  <th className="py-3.5 px-5 text-right">
                    {isSuperAdmin ? "Total Amount" : "Store Subtotal"}
                  </th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {displayedOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const displayTotal = isSuperAdmin ? order.total_amount : order.vendor_subtotal;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50/80 transition-colors group"
                    >
                      {/* Order ID & Date */}
                      {/* <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-zinc-900 text-sm group-hover:text-emerald-700 transition-colors">
                            #{order.id}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                        </div>
                      </td> */}

                      {/* Customer Info */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <p className="font-bold text-zinc-800 text-xs flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{order.full_name}</span>
                          </p>
                          <p className="text-[11px] text-zinc-500 font-mono">
                            {order.phone}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate max-w-[160px]">
                            {order.email}
                          </p>
                        </div>
                      </td>

                      {/* Items Preview */}
                      <td className="py-4 px-5">
                        <div className="space-y-1.5 max-w-xs">
                          {order.items?.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                              {item.product_image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.product_image}
                                  alt={item.product_name}
                                  className="w-7 h-7 rounded-lg object-cover border border-zinc-200 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">
                                  <Leaf className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-zinc-800 text-xs truncate max-w-[180px]">
                                  {item.product_name}
                                </p>
                                <p className="text-[10px] text-zinc-400">
                                  Qty: {item.quantity} • {fmtPrice(item.price)}
                                  {isSuperAdmin && item.vendor_name && (
                                    <span className="text-zinc-500"> • {item.vendor_name}</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}

                          {order.items?.length > 2 && (
                            <span className="text-[10px] font-semibold text-zinc-400">
                              +{order.items.length - 2} more item{order.items.length - 2 > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Shipping Address */}
                      <td className="py-4 px-5 max-w-[200px]">
                        <div className="flex items-start gap-1 text-zinc-600 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <p className="line-clamp-2 leading-tight" title={order.address}>
                            {order.address}
                          </p>
                        </div>
                        {order.notes && (
                          <p className="text-[10px] text-amber-700 italic mt-1 line-clamp-1">
                            Note: {order.notes}
                          </p>
                        )}
                      </td>

                      {/* Total Price */}
                      <td className="py-4 px-5 text-right">
                        <div className="space-y-0.5">
                          <span className="font-bold font-mono text-zinc-900 text-sm">
                            {fmtPrice(displayTotal)}
                          </span>
                          <p className="text-[10px] text-emerald-700 font-medium">
                            Cash on Delivery
                          </p>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          <span>{cfg.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetails(order)}
                          className="rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-emerald-700 text-xs font-semibold h-8 px-3 gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Order Details & Status Manager Modal ───────────────────────────────── */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={closeDetails}
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200/80 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-100 bg-zinc-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-zinc-900 text-lg">
                      Order #{activeModalOrder.id}
                    </h3>
                    <span className="text-xs font-mono bg-zinc-200/70 text-zinc-700 px-2 py-0.5 rounded-lg font-semibold">
                      COD
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Placed on {formatDate(activeModalOrder.created_at)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="p-2 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Action Success Alert */}
              {actionSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* Status Update Control Section */}
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Update Order Status
                  </h4>
                  <span className="text-[11px] text-zinc-400">
                    {isSuperAdmin ? "Administrator controls" : "Vendor fulfillment controls"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20"
                  >
                    <option value="pending">Pending Verification</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped / In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <Button
                    onClick={handleStatusUpdate}
                    disabled={isUpdating || modalStatus === activeModalOrder.status}
                    className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Update Status</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Customer & Delivery Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Details */}
                <div className="bg-zinc-50/70 rounded-2xl p-4 border border-zinc-200/70 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Customer Details</span>
                  </h4>
                  <p className="font-bold text-zinc-900 text-sm">
                    {activeModalOrder.full_name}
                  </p>
                  <p className="text-xs text-zinc-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <a
                      href={`tel:${activeModalOrder.phone}`}
                      className="font-mono hover:text-emerald-700 hover:underline"
                    >
                      {activeModalOrder.phone}
                    </a>
                  </p>
                  <p className="text-xs text-zinc-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <a
                      href={`mailto:${activeModalOrder.email}`}
                      className="hover:text-emerald-700 hover:underline"
                    >
                      {activeModalOrder.email}
                    </a>
                  </p>
                </div>

                {/* Delivery Address */}
                <div className="bg-zinc-50/70 rounded-2xl p-4 border border-zinc-200/70 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Delivery Address</span>
                  </h4>
                  <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                    {activeModalOrder.address}
                  </p>
                  {activeModalOrder.notes && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-800">
                      <strong>Special Note:</strong> {activeModalOrder.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {isSuperAdmin ? "All Order Items" : "Your Store Items"}
                  </h4>
                  <span className="text-xs font-semibold text-zinc-500">
                    {activeModalOrder.items?.length || 0} product line(s)
                  </span>
                </div>

                <div className="border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-100">
                  {activeModalOrder.items?.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-4 bg-white">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.product_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">
                            <Leaf className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-800 text-xs truncate">
                            {item.product_name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                            {item.sku && <span>SKU: {item.sku}</span>}
                            {item.pack_size && (
                              <span>• {item.pack_size} {item.unit || ""}</span>
                            )}
                            {isSuperAdmin && item.vendor_name && (
                              <span className="text-emerald-700 font-medium">
                                • Vendor: {item.vendor_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-zinc-900 text-xs">
                          {fmtPrice(item.subtotal)}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {item.quantity} × {fmtPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-zinc-800">
                    {fmtPrice(isSuperAdmin ? activeModalOrder.total_amount : activeModalOrder.vendor_subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Shipping & Delivery</span>
                  <span className="text-emerald-700 font-semibold">FREE (COD)</span>
                </div>
                <div className="border-t border-zinc-200 pt-2 flex items-center justify-between text-sm font-bold text-zinc-900">
                  <span>{isSuperAdmin ? "Total to Collect" : "Store Amount Due"}</span>
                  <span className="text-base font-display font-bold text-emerald-700">
                    {fmtPrice(isSuperAdmin ? activeModalOrder.total_amount : activeModalOrder.vendor_subtotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-zinc-50/80 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Payment: Cash on Delivery
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={closeDetails}
                className="rounded-xl border-zinc-300 text-xs font-semibold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
