"use client";
import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";

export const useVendorStore = create((set, get) => ({
    vendors: [],
    isLoading: false,
    error: null,
    statusFilter: "all",

    // Fetch vendors, optionally filtered by status
    fetchVendors: async (status = "all") => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/auth/vendors", {
                params: status && status !== "all" ? { status } : {},
            });
            set({
                vendors: response.data,
                statusFilter: status,
                isLoading: false,
            });
            return { success: true };
        } catch (err) {
            const errorMessage =
                err.response?.data?.error || err.message || "Failed to fetch vendors";
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Clear vendors and reset state
    reset: () => set({ vendors: [], error: null, isLoading: false, statusFilter: "all" }),
}));