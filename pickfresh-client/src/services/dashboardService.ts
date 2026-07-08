import { api } from "./api";

export type AdminDashboardData = {
  users: { total: number; vendors: number };
  products: number;
  categories: number;
  orders: { total: number; pending: number; delivered: number; cancelled: number };
  revenue: number;
  topCategories: { _id: string; name: string; orders: number; revenue: number }[];
  topProducts: { _id: string; name: string; totalSold: number; revenue: number }[];
  recentOrders: any[];
};

export type VendorDashboardData = {
  products: { total: number; outOfStock: number };
  revenue: number;
  orders: { _id: string; count: number }[];
};

export type CustomerDashboardData = {
  orders: { total: number; active: number };
  wishlistCount: number;
  addressCount: number;
};

export type DeliveryDashboardData = {
  assigned: number;
  completed: number;
  inProgress: number;
  isAvailable: boolean;
  recentAssigned: any[];
};

export const dashboardService = {
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const response = await api.get("/dashboard/admin");
    return response.data.data;
  },

  async getVendorDashboard(): Promise<VendorDashboardData> {
    const response = await api.get("/dashboard/vendor");
    return response.data.data;
  },

  async getCustomerDashboard(): Promise<CustomerDashboardData> {
    const response = await api.get("/dashboard/customer");
    return response.data.data;
  },

  async getDeliveryDashboard(): Promise<DeliveryDashboardData> {
    const response = await api.get("/dashboard/delivery");
    return response.data.data;
  },
};
