import { create } from "zustand";
import { notifications } from "../utils/mockData";
import type { NotificationItem } from "../types/domain";

type NotificationState = {
  items: NotificationItem[];
  markAllRead: () => void;
  push: (notification: NotificationItem) => void;
};

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  items: notifications,
  markAllRead: () => set({ items: get().items.map((item) => ({ ...item, read: true })) }),
  push: (notification) => set({ items: [notification, ...get().items] }),
}));
