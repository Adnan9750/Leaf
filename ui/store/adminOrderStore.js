"use client";

import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";

const parseError = (err, fallback = "An unexpected error occurred.") => {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (data.detail) return data.detail;
  if (data.errors && typeof data.errors === "object") {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first)) return first[0];
    if (typeof first === "string") return first;
  }
  return fallback;
};

export const useAdminOrderStore = create((set, get) => ({
  orders: [],
  stats: {
    total_orders: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    total_revenue: 0,
  },
  isLoading: false,
  isUpdating: false,
  error: null,
  statusFilter: "all",
  searchQuery: "",
  vendorFilter: "all",

  setStatusFilter: (status) => set({ statusFilter: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setVendorFilter: (vendorId) => set({ vendorFilter: vendorId }),

  fetchOrders: async (overrideParams = {}) => {
    set({ isLoading: true, error: null });
    const { statusFilter, searchQuery, vendorFilter } = get();

    const params = {
      status: overrideParams.status ?? statusFilter,
      search: overrideParams.search ?? searchQuery,
      vendor_id: overrideParams.vendor_id ?? vendorFilter,
    };

    try {
      const res = await axiosInstance.get("/store/orders/", { params });
      const data = res.data;
      if (data.success) {
        set({
          orders: data.orders || [],
          stats: data.stats || get().stats,
          isLoading: false,
          error: null,
        });
        return { success: true, orders: data.orders, stats: data.stats };
      } else {
        const msg = data.message || "Failed to load orders.";
        set({ error: msg, isLoading: false });
        return { success: false, error: msg };
      }
    } catch (err) {
      const msg = parseError(err, "Failed to load orders.");
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  updateOrderStatus: async (orderId, newStatus, notes) => {
    set({ isUpdating: true, error: null });
    try {
      const payload = { status: newStatus };
      if (notes !== undefined) payload.notes = notes;

      const res = await axiosInstance.patch(`/store/orders/${orderId}/`, payload);
      const data = res.data;
      if (data.success && data.order) {
        const updated = data.order;
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, ...updated } : o)),
          isUpdating: false,
        }));
        // Re-fetch stats in background
        get().fetchOrders();
        return { success: true, order: updated };
      }
      const msg = data.message || "Failed to update order.";
      set({ error: msg, isUpdating: false });
      return { success: false, error: msg };
    } catch (err) {
      const msg = parseError(err, "Failed to update order status.");
      set({ error: msg, isUpdating: false });
      return { success: false, error: msg };
    }
  },

  fetchOrderDetail: async (orderId) => {
    try {
      const res = await axiosInstance.get(`/store/orders/${orderId}/`);
      if (res.data.success && res.data.order) {
        return { success: true, order: res.data.order };
      }
      return { success: false, error: res.data.message || "Order not found." };
    } catch (err) {
      return { success: false, error: parseError(err, "Failed to load order.") };
    }
  },
}));
