import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "../types/domain";
import { cartService } from "../services/cartService";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";

type CartState = {
  items: CartItem[];
  coupon: string | null;
  isSyncing: boolean;
  addItem: (product: Product) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  applyCoupon: (code: string) => void;
  syncFromBackend: () => Promise<void>;
  setItems: (items: CartItem[]) => void;
};

const isAuthenticated = () => {
  return useAuthStore.getState().isAuthenticated;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isSyncing: false,

      setItems: (items) => set({ items }),

      syncFromBackend: async () => {
        if (!isAuthenticated()) return;
        set({ isSyncing: true });
        try {
          const items = await cartService.getCart();
          set({ items, isSyncing: false });
        } catch {
          set({ isSyncing: false });
        }
      },

      addItem: async (product) => {
        const existing = get().items.find((item) => item.product.id === product.id);
        const previousItems = get().items;
        set({
          items: existing
            ? get().items.map((item) =>
                item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              )
            : [...get().items, { product, quantity: 1 }],
        });

        if (isAuthenticated()) {
          try {
            const items = await cartService.addItem(product.id, 1);
            set({ items });
          } catch (error) {
            set({ items: previousItems });
            throw error;
          }
        }
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity < 1) return;
        const previousItems = get().items;
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });

        if (isAuthenticated()) {
          try {
            const items = await cartService.updateQuantity(productId, quantity);
            set({ items });
          } catch (error) {
            set({ items: previousItems });
            throw error;
          }
        }
      },

      removeItem: async (productId) => {
        const previousItems = get().items;
        set({ items: get().items.filter((item) => item.product.id !== productId) });

        if (isAuthenticated()) {
          try {
            const items = await cartService.removeItem(productId);
            set({ items });
          } catch (error) {
            set({ items: previousItems });
            throw error;
          }
        }
      },

      clear: async () => {
        const previousState = { items: get().items, coupon: get().coupon };
        set({ items: [], coupon: null });

        if (isAuthenticated()) {
          try {
            await cartService.clearCart();
          } catch (error) {
            set(previousState);
            throw error;
          }
        }
      },

      applyCoupon: (code) => {
        set({ coupon: code.toUpperCase() });
        toast.success(`Coupon ${code.toUpperCase()} applied!`);
      },
    }),
    { name: "pickfresh-cart" }
  )
);

export const getCartTotals = (items: CartItem[], coupon: string | null) => {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product.offerPrice ?? item.product.price) * item.quantity,
    0
  );
  const discount = coupon ? Math.round(subtotal * 0.1) : 0;
  const tax = Math.round((subtotal - discount) * 0.05);
  const delivery = subtotal > 499 || subtotal === 0 ? 0 : 49;
  return { subtotal, discount, tax, delivery, total: subtotal - discount + tax + delivery };
};
