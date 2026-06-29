import { api } from "./api";
import type { Product } from "../types/domain";

const mapBackendProduct = (item: any): Product => ({
  id: item._id,
  name: item.name,
  category: item.category?.name ?? "Fresh Picks",
  brand: item.brand ?? "PickFresh",
  price: item.price,
  offerPrice: item.offerPrice ?? undefined,
  rating: item.ratings ?? 4.5,
  reviews: item.reviewsCount ?? 0,
  stock: item.stock ?? 0,
  unit: item.unit ?? "piece",
  image: item.images?.[0] ?? "",
  tags: ["Fresh", "Fast delivery"],
  nutrition: [item.description ?? "Naturally fresh"],
  vendor: "PickFresh Market",
});

export const wishlistService = {
  // GET /wishlist
  async getWishlist(): Promise<Product[]> {
    const response = await api.get("/wishlist");
    const products = response.data.data?.products || [];
    return products.map(mapBackendProduct);
  },

  // POST /wishlist
  async addProduct(productId: string): Promise<Product[]> {
    const response = await api.post("/wishlist", { product: productId });
    const products = response.data.data?.products || [];
    return products.map(mapBackendProduct);
  },

  // DELETE /wishlist/:productId
  async removeProduct(productId: string): Promise<Product[]> {
    const response = await api.delete(`/wishlist/${productId}`);
    const products = response.data.data?.products || [];
    return products.map(mapBackendProduct);
  },
};
