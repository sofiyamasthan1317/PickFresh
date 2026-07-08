import { api } from "./api";

export type AdminUserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  isEmailVerified: boolean;
  createdAt: string;
};

export type AdminVendorItem = {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  vendorStatus: "pending" | "approved" | "rejected" | "suspended";
  createdAt: string;
};

export type AdminDeliveryPartnerItem = {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  vehicleType?: string;
  vehicleNumber?: string;
  isAvailable: boolean;
  createdAt: string;
};

export type AdminReportData = {
  sales: { _id: { year: number; month: number; day?: number }; revenue: number; orders: number }[];
  revenue: { total: { total: number; orders: number; avg: number }; byPaymentMethod: any[]; byStatus: any[] };
  inventory: { total: number; outOfStock: number; lowStock: number; inStock: number; byCategory: any[] };
};

export const adminService = {
  // Users
  async getUsers(query: any = {}): Promise<{ users: AdminUserItem[]; pagination: any }> {
    const res = await api.get("/admin/users", { params: query });
    const users = (res.data.data || []).map((u: any) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      isBlocked: u.isBlocked || false,
      isEmailVerified: u.isEmailVerified || false,
      createdAt: new Date(u.createdAt).toLocaleDateString("en-IN"),
    }));
    return { users, pagination: res.data.pagination };
  },

  async updateUser(id: string, update: any): Promise<void> {
    await api.put(`/admin/users/${id}`, update);
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  async blockUser(id: string): Promise<void> {
    await api.patch(`/admin/users/${id}/block`);
  },

  async unblockUser(id: string): Promise<void> {
    await api.patch(`/admin/users/${id}/unblock`);
  },

  async updateRole(id: string, role: string): Promise<void> {
    await api.patch(`/admin/users/${id}/role`, { role });
  },

  // Vendors
  async getVendors(query: any = {}): Promise<AdminVendorItem[]> {
    const res = await api.get("/admin/vendors", { params: query });
    return (res.data.data || []).map((v: any) => ({
      id: v._id,
      name: v.name,
      email: v.email,
      businessName: v.businessName,
      vendorStatus: v.vendorStatus,
      createdAt: new Date(v.createdAt).toLocaleDateString("en-IN"),
    }));
  },

  async approveVendor(id: string): Promise<void> {
    await api.patch(`/admin/vendors/${id}/approve`);
  },

  async rejectVendor(id: string): Promise<void> {
    await api.patch(`/admin/vendors/${id}/reject`);
  },

  async suspendVendor(id: string): Promise<void> {
    await api.patch(`/admin/vendors/${id}/suspend`);
  },

  // Delivery Partners
  async getDeliveryPartners(query: any = {}): Promise<AdminDeliveryPartnerItem[]> {
    const res = await api.get("/admin/delivery-partners", { params: query });
    return (res.data.data || []).map((d: any) => ({
      id: d._id,
      name: d.name,
      email: d.email,
      isBlocked: d.isBlocked || false,
      vehicleType: d.vehicleType,
      vehicleNumber: d.vehicleNumber,
      isAvailable: d.isAvailable || false,
      createdAt: new Date(d.createdAt).toLocaleDateString("en-IN"),
    }));
  },

  async suspendDeliveryPartner(id: string): Promise<void> {
    await api.patch(`/admin/delivery-partners/${id}/suspend`);
  },

  async activateDeliveryPartner(id: string): Promise<void> {
    await api.patch(`/admin/delivery-partners/${id}/activate`);
  },

  async getDeliveryPerformance(id: string): Promise<any> {
    const res = await api.get(`/admin/delivery-partners/${id}/performance`);
    return res.data.data;
  },

  async assignDelivery(orderId: string, deliveryPartnerId: string): Promise<void> {
    await api.post(`/delivery/assign/${orderId}`, { deliveryPartnerId });
  },

  // Reviews
  async getReviews(query: any = {}): Promise<any[]> {
    const res = await api.get("/admin/reviews", { params: query });
    return res.data.data || [];
  },

  async hideReview(id: string): Promise<void> {
    await api.patch(`/admin/reviews/${id}/hide`);
  },

  async showReview(id: string): Promise<void> {
    await api.patch(`/admin/reviews/${id}/show`);
  },

  async deleteReview(id: string): Promise<void> {
    await api.delete(`/admin/reviews/${id}`);
  },

  // Reports
  async getSalesReport(query: any = {}): Promise<any[]> {
    const res = await api.get("/admin/reports/sales", { params: query });
    return res.data.data || [];
  },

  async getRevenueReport(query: any = {}): Promise<any> {
    const res = await api.get("/admin/reports/revenue", { params: query });
    return res.data.data;
  },

  async getInventoryReport(): Promise<any> {
    const res = await api.get("/admin/reports/inventory");
    return res.data.data;
  },

  // Categories
  async createCategory(cat: any): Promise<void> {
    await api.post("/categories", cat);
  },

  async updateCategory(id: string, cat: any): Promise<void> {
    await api.put(`/categories/${id}`, cat);
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },

  // Banners
  async getBanners(): Promise<any[]> {
    const res = await api.get("/banners");
    return res.data.data || [];
  },

  async createBanner(banner: any): Promise<void> {
    await api.post("/banners", banner);
  },

  async updateBanner(id: string, banner: any): Promise<void> {
    await api.put(`/banners/${id}`, banner);
  },

  async deleteBanner(id: string): Promise<void> {
    await api.delete(`/banners/${id}`);
  },

  // Platform Settings
  async getSettings(): Promise<any> {
    const res = await api.get("/admin/settings");
    return res.data.data;
  },

  async updateSettings(data: any): Promise<any> {
    const res = await api.put("/admin/settings", data);
    return res.data.data;
  },

  // Bulk Product Actions
  async bulkUpdateProducts(ids: string[], update: any): Promise<void> {
    await api.patch("/admin/products/bulk-update", { ids, update });
  },

  async bulkDeleteProducts(ids: string[]): Promise<void> {
    await api.delete("/admin/products/bulk-delete", { data: { ids } });
  },
};
