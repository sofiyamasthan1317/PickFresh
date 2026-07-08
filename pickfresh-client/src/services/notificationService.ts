import { api } from "./api";
import type { NotificationItem } from "../types/domain";

const mapBackendNotification = (item: any): NotificationItem => ({
  id: item._id,
  title: item.title,
  body: item.message,
  read: item.isRead,
  createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "",
  type: item.type,
  priority: item.priority,
  referenceId: item.referenceId ?? item.refId,
  referenceType: item.referenceType,
});

export const notificationService = {
  async getNotifications(page = 1, limit = 20, filter = "all"): Promise<{ items: NotificationItem[]; total: number; pages: number }> {
    const response = await api.get("/notifications", { params: { page, limit, filter } });
    const payload = response.data?.data || {};
    const items = (payload.notifications || []).map(mapBackendNotification);
    return { items, total: payload.pagination?.total ?? items.length, pages: payload.pagination?.pages ?? 1 };
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get("/notifications/unread-count");
    return response.data?.data?.count ?? 0;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  async clearNotifications(): Promise<void> {
    await api.delete("/notifications/clear");
  },
};
