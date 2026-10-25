"use client";
import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";
import { useLoaderStore } from "./loaderStore";

export const useCategoryStore = create((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,
  statusFilter: "all",
  searchQuery: "",
  viewMode: "table", // 'cards' | 'table'

  setViewMode: (mode) => set({ viewMode: mode }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Fetch categories from backend
  fetchCategories: async (status = "all", search = "", withGlobalLoader = false) => {
    set({ isLoading: true, error: null });
    if (withGlobalLoader) {
      useLoaderStore.getState().showLoader("Loading category directory...");
    }
    try {
      const params = {};
      if (status && status !== "all") params.status = status;
      if (search && search.trim()) params.search = search.trim();

      const response = await axiosInstance.get("/store/categories/", { params });
      set({
        categories: response.data,
        isLoading: false,
        error: null,
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to load categories";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    } finally {
      if (withGlobalLoader) {
        useLoaderStore.getState().hideLoader();
      }
    }
  },

  // Create a new category
  createCategory: async ({ name, description = "", is_active = true }) => {
    useLoaderStore.getState().showLoader("Creating new category...");
    try {
      const response = await axiosInstance.post("/store/categories/", {
        name: name.trim(),
        description: description.trim(),
        is_active,
      });
      const newCategory = response.data;
      set((state) => ({
        categories: [newCategory, ...state.categories],
      }));
      return { success: true, data: newCategory };
    } catch (err) {
      let errorMessage = "Failed to create category";
      if (err.response?.data) {
        const d = err.response.data;
        if (typeof d === "string") errorMessage = d;
        else if (d.name) errorMessage = Array.isArray(d.name) ? d.name.join(" ") : d.name;
        else if (d.error) errorMessage = d.error;
        else if (d.detail) errorMessage = d.detail;
      }
      return { success: false, error: errorMessage };
    } finally {
      useLoaderStore.getState().hideLoader();
    }
  },

  // Update an existing category
  updateCategory: async (id, payload) => {
    useLoaderStore.getState().showLoader("Updating category...");
    try {
      const cleanPayload = {};
      if (payload.name !== undefined) cleanPayload.name = payload.name.trim();
      if (payload.description !== undefined) cleanPayload.description = payload.description.trim();
      if (payload.is_active !== undefined) cleanPayload.is_active = payload.is_active;

      const response = await axiosInstance.patch(`/store/categories/${id}/`, cleanPayload);
      const updatedCategory = response.data;
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id ? { ...c, ...updatedCategory } : c
        ),
      }));
      return { success: true, data: updatedCategory };
    } catch (err) {
      let errorMessage = "Failed to update category";
      if (err.response?.data) {
        const d = err.response.data;
        if (typeof d === "string") errorMessage = d;
        else if (d.name) errorMessage = Array.isArray(d.name) ? d.name.join(" ") : d.name;
        else if (d.error) errorMessage = d.error;
        else if (d.detail) errorMessage = d.detail;
      }
      return { success: false, error: errorMessage };
    } finally {
      useLoaderStore.getState().hideLoader();
    }
  },

  // Toggle active / inactive status
  toggleCategoryStatus: async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    useLoaderStore.getState().showLoader(
      nextStatus ? "Activating category..." : "Deactivating category..."
    );
    try {
      const response = await axiosInstance.patch(`/store/categories/${id}/`, {
        is_active: nextStatus,
      });
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id ? { ...c, is_active: nextStatus } : c
        ),
      }));
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to update status";
      return { success: false, error: errorMessage };
    } finally {
      useLoaderStore.getState().hideLoader();
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    useLoaderStore.getState().showLoader("Deleting category...");
    try {
      await axiosInstance.delete(`/store/categories/${id}/`);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to delete category";
      return { success: false, error: errorMessage };
    } finally {
      useLoaderStore.getState().hideLoader();
    }
  },

  // Reset store
  reset: () =>
    set({
      categories: [],
      error: null,
      isLoading: false,
      statusFilter: "all",
      searchQuery: "",
    }),
}));
