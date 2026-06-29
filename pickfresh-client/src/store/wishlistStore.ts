import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../types/domain";
import { wishlistService } from "../services/wishlistService";
import { useAuthStore } from "./authStore";

type WishlistState = {
  products: Product[];
  toggle: (product: Product) => Promise<void>;
  has: (productId: string) => boolean;
  syncFromBackend: () => Promise<void>;
};

const isAuthenticated = () => {
  return useAuthStore.getState().isAuthenticated;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      products: [],

      syncFromBackend: async () => {
        if (!isAuthenticated()) return;
        try {
          const products = await wishlistService.getWishlist();
          set({ products });
        } catch {
          // Ignore - fallback to local state
        }
      },

      toggle: async (product) => {
        const alreadyIn = get().products.some((item) => item.id === product.id);
        const previousProducts = get().products;

        set({
          products: alreadyIn
            ? get().products.filter((item) => item.id !== product.id)
            : [...get().products, product],
        });

        if (isAuthenticated()) {
          try {
            if (alreadyIn) {
              const products = await wishlistService.removeProduct(product.id);
              set({ products });
            } else {
              const products = await wishlistService.addProduct(product.id);
              set({ products });
            }
          } catch (error) {
            set({ products: previousProducts });
            throw error;
          }
        }
      },

      has: (productId) => get().products.some((item) => item.id === productId),
    }),
    { name: "pickfresh-wishlist" }
  )
);
