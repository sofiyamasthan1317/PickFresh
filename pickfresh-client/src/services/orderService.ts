import { api } from "./api";
import type { Order } from "../types/domain";

const mapBackendOrder = (item: any): Order => ({
  id: item.orderId || item._id,
  status: item.orderStatus ?? "Pending",
  total: item.totalAmount ?? 0,
  placedAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
  items: (item.products || []).map((p: any) => ({
    product: {
      id: p.product?._id || p.product,
      name: p.name,
      category: "Fresh Picks",
      brand: "PickFresh",
      price: p.price,
      rating: 4.5,
      reviews: 0,
      stock: 10,
      unit: "piece",
      image: p.product?.images?.[0] ?? "",
      tags: [],
      nutrition: [],
      vendor: "PickFresh Market",
    },
    quantity: p.quantity,
  })),
  eta: item.orderStatus === "Delivered" ? "Delivered" : "Today, 7:30 PM",
});

export type CreateOrderPayload = {
  shippingAddress: string;
  paymentMethod?: "COD" | "Card" | "UPI" | "Wallet";
  products?: { product: string; quantity: number }[];
  deliveryCharge?: number;
  tax?: number;
  discount?: number;
};

export const orderService = {
  // GET /orders
  async getOrders(): Promise<Order[]> {
    const response = await api.get("/orders");
    return (response.data.data || []).map(mapBackendOrder);
  },

  // GET /orders/:id
  async getOrderById(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return mapBackendOrder(response.data.data);
  },

  // POST /orders
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const response = await api.post("/orders", payload);
    return mapBackendOrder(response.data.data);
  },
};
