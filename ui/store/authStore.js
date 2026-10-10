"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../utils/axiosInstance";
import { useLoaderStore } from "./loaderStore";

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: async (email, password) => {
        useLoaderStore.getState().showLoader("Signing into LeafLens...");
        try {
          const response = await axiosInstance.post("/auth/login", { email, password });
          const user = response.data.user;
          set({ isAuthenticated: true, user });
          return { success: true };
        } catch (err) {
          console.error("Login error", err);
          return { success: false, error: err.response?.data?.error || err.message };
        } finally {
          useLoaderStore.getState().hideLoader();
        }
      },

      logout: async () => {
        useLoaderStore.getState().showLoader("Logging out...");
        try {
          await axiosInstance.post("/auth/logout", {});
        } catch (e) { }
        set({ isAuthenticated: false, user: null });
        useLoaderStore.getState().hideLoader();
      },
    }),
    {
      name: "auth-storage",
    }
  )
);