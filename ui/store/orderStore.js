"use client";

import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";

const parseError = (err, fallback = "Order placement failed.") => {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (data.errors) return data.errors;
  return fallback;
};

export const useOrderStore = create((set) => ({
  isPlacing: false,
  placedOrder: null,
  error: null,

  placeOrder: async (payload) => {
    set({ isPlacing: true, error: null, placedOrder: null });
    try {
      const res = await axiosInstance.post("/store/public/orders/", payload);
      const data = res.data;
      if (data.success && data.order) {
        set({ placedOrder: data.order, isPlacing: false, error: null });
        return { success: true, order: data.order };
      }
      const err = data.errors || data.message || "Order placement failed.";
      set({ error: err, isPlacing: false });
      return { success: false, error: err };
    } catch (err) {
      const parsed = parseError(err, "Failed to place order. Please try again.");
      set({ error: parsed, isPlacing: false });
      return { success: false, error: parsed };
    }
  },

  reset: () => set({ isPlacing: false, placedOrder: null, error: null }),
}));
