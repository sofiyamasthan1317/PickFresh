import { api } from "./api";

export type DeliveryOrder = {
  id: string;
  orderId: string;
  status: string;
  customerName: string;
  customerPhone: string;
  address: string;
  total: number;
  updatedAt: string;
};

const mapDeliveryOrder = (item: any): DeliveryOrder => ({
  id: item._id,
  orderId: item.orderId || item._id,
  status: item.orderStatus,
  customerName: item.user?.name ?? "Customer",
  customerPhone: item.user?.phone ?? "",
  address: item.shippingAddress
    ? `${item.shippingAddress.houseNumber ?? ""} ${item.shippingAddress.street ?? ""}, ${item.shippingAddress.city ?? ""}`.trim()
    : "Address not found",
  total: item.totalAmount ?? 0,
  updatedAt: item.updatedAt
    ? new Date(item.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "",
});

export const deliveryService = {
  async getMyDeliveries(status?: string): Promise<DeliveryOrder[]> {
    const response = await api.get("/delivery/my-deliveries", { params: status ? { status } : {} });
    return (response.data.data || []).map(mapDeliveryOrder);
  },

  async getCompletedDeliveries(): Promise<DeliveryOrder[]> {
    const response = await api.get("/delivery/completed");
    return (response.data.data || []).map(mapDeliveryOrder);
  },

  async updateDeliveryStatus(orderId: string, orderStatus: "Out For Delivery" | "Delivered", note?: string): Promise<void> {
    await api.put(`/delivery/status/${orderId}`, { orderStatus, note });
  },

  async getEarnings(): Promise<any> {
    const response = await api.get("/delivery/earnings");
    return response.data.data;
  },

  async toggleAvailability(): Promise<boolean> {
    const response = await api.patch("/delivery/availability");
    return response.data.data.isAvailable;
  },

  async updateProfile(profile: { vehicleType?: string; vehicleNumber?: string; phone?: string }): Promise<void> {
    await api.patch("/delivery/profile", profile);
  },
};
