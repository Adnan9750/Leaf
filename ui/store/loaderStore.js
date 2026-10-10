"use client";

import { create } from "zustand";

export const useLoaderStore = create((set) => ({
  isLoading: false,
  message: "Loading...",

  showLoader: (message = "Loading...") =>
    set({ isLoading: true, message }),

  hideLoader: () =>
    set({ isLoading: false }),

  setMessage: (message) =>
    set({ message }),
}));
