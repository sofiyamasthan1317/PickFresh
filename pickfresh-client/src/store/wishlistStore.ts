import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../types/domain";

type WishlistState = {
  products: Product[];
  toggle: (product: Product) => void;
  has: (productId: string) => boolean;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      products: [],
      toggle: (product) =>
        set({
          products: get().products.some((item) => item.id === product.id)
            ? get().products.filter((item) => item.id !== product.id)
            : [...get().products, product],
        }),
      has: (productId) => get().products.some((item) => item.id === productId),
    }),
    { name: "pickfresh-wishlist" },
  ),
);
