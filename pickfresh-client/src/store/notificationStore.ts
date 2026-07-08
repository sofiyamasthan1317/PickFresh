import { create } from "zustand";
import type { NotificationItem } from "../types/domain";
import { notificationService } from "../services/notificationService";
import { useAuthStore } from "./authStore";

type NotificationState = {
  items: NotificationItem[];
  unreadCount: number;
  isSyncing: boolean;
  syncFromBackend: (page?: number, limit?: number, filter?: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  markOneRead: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  push: (notification: NotificationItem) => void;
  refreshUnreadCount: () => Promise<void>;
};

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  items: [],
  unreadCount: 0,
  isSyncing: false,

  syncFromBackend: async (page = 1, limit = 20, filter = "all") => {
    if (!useAuthStore.getState().isAuthenticated) return;
    set({ isSyncing: true });
    try {
      const { items } = await notificationService.getNotifications(page, limit, filter);
      set({ items, isSyncing: false });
      await get().refreshUnreadCount();
    } catch {
      set({ isSyncing: false });
    }
  },

  markAllRead: async () => {
    set({ items: get().items.map((item) => ({ ...item, read: true })), unreadCount: 0 });
    try {
      await notificationService.markAllAsRead();
    } catch {
      // keep optimistic state
    }
  },

  markOneRead: async (id) => {
    set({ items: get().items.map((item) => (item.id === id ? { ...item, read: true } : item)), unreadCount: Math.max(get().unreadCount - 1, 0) });
    try {
      await notificationService.markAsRead(id);
    } catch {
      // keep optimistic state
    }
  },

  remove: async (id) => {
    const previous = get().items;
    const nextItems = get().items.filter((item) => item.id !== id);
    const removedItem = get().items.find((item) => item.id === id);
    set({ items: nextItems, unreadCount: removedItem && !removedItem.read ? Math.max(get().unreadCount - 1, 0) : get().unreadCount });
    try {
      await notificationService.deleteNotification(id);
    } catch {
      set({ items: previous });
    }
  },

  clearAll: async () => {
    set({ items: [], unreadCount: 0 });
    try {
      await notificationService.clearNotifications();
    } catch {
      // keep optimistic state
    }
  },

  push: (notification) => set({ items: [notification, ...get().items], unreadCount: get().unreadCount + 1 }),
  refreshUnreadCount: async () => {
    try {
      const count = await notificationService.getUnreadCount();
      set({ unreadCount: count });
    } catch {
      // ignore
    }
  },
}));
