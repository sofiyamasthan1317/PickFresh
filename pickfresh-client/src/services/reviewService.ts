import { api } from "./api";

export type ProductReview = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const mapBackendReview = (item: any): ProductReview => ({
  id: item._id,
  userName: item.user?.name ?? "PickFresh customer",
  rating: item.rating,
  comment: item.comment ?? "",
  createdAt: item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "",
});

export const reviewService = {
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    const response = await api.get(`/reviews/product/${productId}`);
    return (response.data.data || []).map(mapBackendReview);
  },

  async createReview(payload: { product: string; rating: number; comment?: string }): Promise<ProductReview> {
    const response = await api.post("/reviews", payload);
    return mapBackendReview(response.data.data);
  },
};
