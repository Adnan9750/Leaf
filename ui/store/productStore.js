"use client";

import { create } from 'zustand';
import axiosInstance from '../utils/axiosInstance';
import { useLoaderStore } from './loaderStore';

export const useProductStore = create((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  // Fetch products list
  fetchProducts: async (withGlobalLoader = false) => {
    set({ isLoading: true, error: null });
    if (withGlobalLoader) {
      useLoaderStore.getState().showLoader('Loading products...');
    }
    try {
      const response = await axiosInstance.get('/store/products/');
      set({ products: response.data, isLoading: false, error: null });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.message || 'Failed to load products';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    } finally {
      if (withGlobalLoader) {
        useLoaderStore.getState().hideLoader();
      }
    }
  },
  // Create a new product
  createProduct: async (payload) => {
    useLoaderStore.getState().showLoader('Creating product...');
    try {
      const response = await axiosInstance.post('/store/products/', payload);
      // Prepend new product to store for immediate UI update
      set(state => ({ products: [response.data, ...state.products] }));
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.message || 'Failed to create product';
      return { success: false, error: errorMessage };
    } finally {
      useLoaderStore.getState().hideLoader();
    }
  },
  reset: () => set({ products: [], error: null, isLoading: false })
}));
