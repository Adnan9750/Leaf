"use client";
import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";
import { useLoaderStore } from "./loaderStore";

export const useVendorStore = create((set, get) => ({
    vendors: [],
    isLoading: false,
    error: null,
    statusFilter: "all",

    // Fetch vendors, optionally filtered by status
    fetchVendors: async (status = "all", withGlobalLoader = false) => {
        set({ isLoading: true, error: null });
        if (withGlobalLoader) {
            useLoaderStore.getState().showLoader("Fetching vendor records...");
        }
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
        } finally {
            if (withGlobalLoader) {
                useLoaderStore.getState().hideLoader();
            }
        }
    },

    // Update vendor status
    updateVendorStatus: async (vendorId, status, rejection_reason = "") => {
        const actionLabel =
            status === "approved"
                ? "Approving vendor & sending email..."
                : status === "rejected"
                ? "Rejecting vendor & sending email..."
                : "Updating status...";
        useLoaderStore.getState().showLoader(actionLabel);
        try {
            const payload = { status };
            if (rejection_reason) {
                payload.rejection_reason = rejection_reason;
            }
            const response = await axiosInstance.patch(`/auth/vendors/${vendorId}/status`, payload);
            set((state) => ({
                vendors: state.vendors.map((v) =>
                    v.id === vendorId ? { ...v, ...response.data, status } : v
                ),
            }));
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage =
                err.response?.data?.error || err.message || "Failed to update vendor status";
            return { success: false, error: errorMessage };
        } finally {
            useLoaderStore.getState().hideLoader();
        }
    },

    // Clear vendors and reset state
    reset: () => set({ vendors: [], error: null, isLoading: false, statusFilter: "all" }),
}));