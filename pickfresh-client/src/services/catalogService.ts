import { api } from "./api";
import { categories, products } from "../utils/mockData";
import type { Category, Product } from "../types/domain";

export type ProductQuery = {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  isAvailable?: boolean;
  sort?: "newest" | "priceLowToHigh" | "priceHighToLow" | "highestRated";
};

export const catalogService = {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get("/categories");
      return response.data.data.map((item: { _id: string; name: string; image?: string; description?: string }) => ({
        id: item._id,
        name: item.name,
        image: item.image ?? "",
        description: item.description ?? "",
        count: 0,
      }));
    } catch {
      return categories;
    }
  },
  async getProducts(query: ProductQuery = {}): Promise<Product[]> {
    try {
      const response = await api.get("/products", { params: query });
      return response.data.data.map((item: { _id: string; name: string; category?: { name?: string }; brand?: string; price: number; offerPrice?: number; ratings?: number; reviewsCount?: number; stock?: number; unit?: string; images?: string[]; description?: string }) => ({
        id: item._id,
        name: item.name,
        category: item.category?.name ?? "Fresh Picks",
        brand: item.brand ?? "PickFresh",
        price: item.price,
        offerPrice: item.offerPrice,
        rating: item.ratings ?? 4.5,
        reviews: item.reviewsCount ?? 0,
        stock: item.stock ?? 0,
        unit: item.unit ?? "piece",
        image: item.images?.[0] ?? "",
        tags: ["Fresh", "Fast delivery"],
        nutrition: [item.description ?? "Naturally fresh"],
        vendor: "PickFresh Market",
      }));
    } catch {
      return products;
    }
  },
};
