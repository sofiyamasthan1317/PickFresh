import { api } from "./api";

export type SearchResult = {
  products: { id: string; name: string; price: number; image: string; category: string }[];
  categories: { id: string; name: string }[];
};

export const searchService = {
  async globalSearch(query: string, limit = 10): Promise<SearchResult> {
    const response = await api.get("/search", { params: { q: query, limit } });
    const data = response.data.data || {};
    return {
      products: (data.products || []).map((item: any) => ({
        id: item._id,
        name: item.name,
        price: item.price,
        image: item.images?.[0] ?? "",
        category: item.category?.name ?? "Fresh Picks",
      })),
      categories: (data.categories || []).map((item: any) => ({
        id: item._id,
        name: item.name,
      })),
    };
  },
};
