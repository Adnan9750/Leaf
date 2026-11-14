"use client";

import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";
import { useLoaderStore } from "./loaderStore";

const parseError = (err, fallback) => {
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

export const useProductStore = create((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async (withGlobalLoader = false) => {
    set({ isLoading: true, error: null });
    if (withGlobalLoader) {
      useLoaderStore.getState().showLoader("Loading products...");
    }
    try {
      const response = await axiosInstance.get("/store/products/");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      set({ products: data, isLoading: false, error: null });
      return { success: true, data };
    } catch (err) {
      const errorMessage = parseError(err, "Failed to load products");
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    } finally {
      if (withGlobalLoader) {
        useLoaderStore.getState().hideLoader();
      }
    }
  },

  createProduct: async (payload) => {
    useLoaderStore.getState().showLoader("Creating product...");
    try {
      const response = await axiosInstance.post("/store/products/", payload);
      const created = response.data?.data ?? response.data;
      set((state) => ({
        products: created ? [created, ...state.products] : state.products,
      }));
      return { success: true, data: created };
    } catch (err) {
      const errorMessage = parseError(err, "Failed to create product");
      const fieldErrors =
        err?.response?.data?.errors && typeof err.response.data.errors === "object"
          ? err.response.data.errors
          : null;
      return { success: false, error: errorMessage, fieldErrors };
    } finally {
      useLoaderStore.getState().hideLoader();
    }
  },

  updateProduct: async (id, payload) => {
    useLoaderStore.getState().showLoader("Saving changes...");
    try {
      const response = await axiosInstance.patch(`/store/products/${id}/`, payload);
      const updated = response.data?.data ?? response.data;
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, ...updated } : p
        ),
      }));
      return { success: true, data: updated };
    } catch (err) {
      const errorMessage = parseError(err, "Failed to update product");
      const fieldErrors =
        err?.response?.data?.errors && typeof err.response.data.errors === "object"
          ? err.response.data.errors
          : null;
      return { success: false, error: errorMessage, fieldErrors };
    } finally {
      useLoaderStore.getState().hideLoader();
    }
  },

  deleteProduct: async (id) => {
    useLoaderStore.getState().showLoader("Deleting product...");
    try {
      await axiosInstance.delete(`/store/products/${id}/`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
      return { success: true };
    } catch (err) {
      const errorMessage = parseError(err, "Failed to delete product");
      return { success: false, error: errorMessage };
    } finally {
      useLoaderStore.getState().hideLoader();
    }
  },

  reset: () => set({ products: [], error: null, isLoading: false }),
}));
