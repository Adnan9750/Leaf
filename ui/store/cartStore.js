"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      toastItem: null,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      clearToast: () => set({ toastItem: null }),

      addToCart: (product, quantity = 1) => {
        if (!product || !product.id) return;
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item.id === product.id);

        const availableStock = product.stock != null ? Number(product.stock) : 999;
        const validQuantity = Math.max(1, quantity);

        let updatedItems;
        if (existingIndex > -1) {
          const existingItem = currentItems[existingIndex];
          const newQty = Math.min(existingItem.quantity + validQuantity, availableStock);
          updatedItems = [...currentItems];
          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: newQty,
            product: { ...existingItem.product, ...product },
          };
        } else {
          const initQty = Math.min(validQuantity, availableStock);
          updatedItems = [
            ...currentItems,
            {
              id: product.id,
              product,
              quantity: initQty,
              addedAt: new Date().toISOString(),
            },
          ];
        }

        set({
          items: updatedItems,
          toastItem: product,
        });
      },

      updateQuantity: (productId, quantity) => {
        const currentItems = get().items;
        const item = currentItems.find((i) => i.id === productId);
        if (!item) return;

        const maxStock = item.product?.stock != null ? Number(item.product.stock) : 999;
        const newQty = Math.max(0, Math.min(quantity, maxStock));

        if (newQty <= 0) {
          set({ items: currentItems.filter((i) => i.id !== productId) });
        } else {
          set({
            items: currentItems.map((i) =>
              i.id === productId ? { ...i, quantity: newQty } : i
            ),
          });
        }
      },

      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalCount: () => {
        return get().items.reduce((total, item) => total + (item.quantity || 1), 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = Number(item.product?.price) || 0;
          return sum + price * (item.quantity || 1);
        }, 0);
      },

      getItemQuantity: (productId) => {
        const found = get().items.find((item) => item.id === productId);
        return found ? found.quantity : 0;
      },
    }),
    {
      name: "leaflens-cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
