import { api } from "./api";
import type { CartItem } from "../types/domain";

const mapBackendCartItem = (item: any): CartItem => ({
  product: {
    id: item.product._id,
    name: item.product.name,
    category: item.product.category?.name ?? "Fresh Picks",
    brand: item.product.brand ?? "PickFresh",
    price: item.product.price,
    offerPrice: item.product.offerPrice ?? undefined,
    rating: item.product.ratings ?? 4.5,
    reviews: item.product.reviewsCount ?? 0,
    stock: item.product.stock ?? 0,
    unit: item.product.unit ?? "piece",
    image: item.product.images?.[0] ?? "",
    tags: ["Fresh", "Fast delivery"],
    nutrition: [item.product.description ?? "Naturally fresh"],
    vendor: "PickFresh Market",
  },
  quantity: item.quantity,
});

export const cartService = {
  // GET /cart
  async getCart(): Promise<CartItem[]> {
    const response = await api.get("/cart");
    const items = response.data.data?.items || [];
    return items.map(mapBackendCartItem);
  },

  // POST /cart/items
  async addItem(productId: string, quantity: number = 1): Promise<CartItem[]> {
    const response = await api.post("/cart/items", { product: productId, quantity });
    const items = response.data.data?.items || [];
    return items.map(mapBackendCartItem);
  },

  // PUT /cart/items/:productId
  async updateQuantity(productId: string, quantity: number): Promise<CartItem[]> {
    const response = await api.put(`/cart/items/${productId}`, { quantity });
    const items = response.data.data?.items || [];
    return items.map(mapBackendCartItem);
  },

  // DELETE /cart/items/:productId
  async removeItem(productId: string): Promise<CartItem[]> {
    const response = await api.delete(`/cart/items/${productId}`);
    const items = response.data.data?.items || [];
    return items.map(mapBackendCartItem);
  },

  // DELETE /cart
  async clearCart(): Promise<void> {
    await api.delete("/cart");
  },
};
