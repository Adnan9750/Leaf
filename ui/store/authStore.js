// ui/store/authStore.js
"use client";
import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";
import { useRouter } from "next/navigation";

// Store for authentication state
export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  // login will call backend and update store
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post("/auth/login", { email, password });
      const user = response.data.user;
      set({ isAuthenticated: true, user });
      return { success: true };
    } catch (err) {
      console.error("Login error", err);
      return { success: false, error: err.response?.data?.error || err.message };
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout", {});
    } catch (e) {
      // ignore errors on logout
    }
    set({ isAuthenticated: false, user: null });
  },
}));
