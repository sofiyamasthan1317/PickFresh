import { api } from "./api";

export type VendorProductItem = {
  id: string;
  name: string;
  price: number;
  offerPrice?: number;
  category?: { _id: string; name: string };
  stock: number;
  isAvailable: boolean;
  brand?: string;
  images: string[];
  description?: string;
};

export const vendorService = {
  // Products CRUD
  async getMyProducts(query: any = {}): Promise<{ products: VendorProductItem[]; pagination: any }> {
    const res = await api.get("/vendor/products", { params: query });
    const products = (res.data.data || []).map((p: any) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      offerPrice: p.offerPrice,
      category: p.category,
      stock: p.stock || 0,
      isAvailable: p.isAvailable || false,
      brand: p.brand,
      images: p.images || [],
      description: p.description,
    }));
    return { products, pagination: res.data.pagination };
  },

  async createProduct(formData: FormData): Promise<void> {
    await api.post("/vendor/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async updateProduct(id: string, formData: FormData): Promise<void> {
    await api.put(`/vendor/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/vendor/products/${id}`);
  },

  async updateProductStock(id: string, stock: number): Promise<void> {
    await api.patch(`/vendor/products/${id}/stock`, { stock });
  },

  async bulkUpdateStock(updates: { id: string; stock: number }[]): Promise<void> {
    await api.patch("/vendor/products/bulk-stock", { updates });
  },

  // Orders
  async getMyOrders(query: any = {}): Promise<{ orders: any[]; pagination: any }> {
    const res = await api.get("/vendor/orders", { params: query });
    return { orders: res.data.data || [], pagination: res.data.pagination };
  },

  async updateOrderStatus(id: string, orderStatus: string, note?: string): Promise<void> {
    await api.patch(`/vendor/orders/${id}/status`, { orderStatus, note });
  },

  // Reviews
  async getMyReviews(): Promise<any> {
    const res = await api.get("/vendor/reviews");
    return res.data;
  },

  async replyToReview(reviewId: string, text: string): Promise<void> {
    await api.post(`/vendor/reviews/${reviewId}/reply`, { text });
  },

  // Analytics & Earnings
  async getMyAnalytics(): Promise<any> {
    const res = await api.get("/vendor/analytics");
    return res.data.data;
  },

  async getMyEarnings(): Promise<any> {
    const res = await api.get("/vendor/earnings");
    return res.data.data;
  },

  // Profile
  async getProfile(): Promise<any> {
    const res = await api.get("/vendor/profile");
    return res.data.data;
  },

  async updateProfile(data: Record<string, string>): Promise<any> {
    const res = await api.put("/vendor/profile", data);
    return res.data.data;
  },

  async uploadLogo(file: File): Promise<any> {
    const fd = new FormData();
    fd.append("logo", file);
    const res = await api.patch("/vendor/profile/logo", fd, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data.data;
  },

  async uploadCover(file: File): Promise<any> {
    const fd = new FormData();
    fd.append("cover", file);
    const res = await api.patch("/vendor/profile/cover", fd, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data.data;
  },
};
