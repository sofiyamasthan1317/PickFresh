import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "../types/domain";

type CartState = {
  items: CartItem[];
  coupon: string | null;
  addItem: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      addItem: (product) => {
        const existing = get().items.find((item) => item.product.id === product.id);
        set({
          items: existing
            ? get().items.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
            : [...get().items, { product, quantity: 1 }],
        });
      },
      updateQuantity: (productId, quantity) =>
        set({ items: get().items.map((item) => (item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item)) }),
      removeItem: (productId) => set({ items: get().items.filter((item) => item.product.id !== productId) }),
      clear: () => set({ items: [], coupon: null }),
      applyCoupon: (code) => set({ coupon: code.toUpperCase() }),
    }),
    { name: "pickfresh-cart" },
  ),
);

export const getCartTotals = (items: CartItem[], coupon: string | null) => {
  const subtotal = items.reduce((sum, item) => sum + (item.product.offerPrice ?? item.product.price) * item.quantity, 0);
  const discount = coupon ? Math.round(subtotal * 0.1) : 0;
  const tax = Math.round((subtotal - discount) * 0.05);
  const delivery = subtotal > 499 || subtotal === 0 ? 0 : 49;
  return { subtotal, discount, tax, delivery, total: subtotal - discount + tax + delivery };
};
