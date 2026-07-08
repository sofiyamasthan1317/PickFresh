import { create } from "zustand";
import { dashboardService } from "../services/dashboardService";
import { useAuthStore } from "./authStore";

type OperationsState = {
  deliveryOnline: boolean;
  vendorRevenue: number;
  adminRevenue: number;
  deliveryEarnings: number;
  setDeliveryOnline: (value: boolean) => void;
  syncRevenue: () => Promise<void>;
};

export const useOperationsStore = create<OperationsState>()((set) => ({
  deliveryOnline: true,
  vendorRevenue: 0,
  adminRevenue: 0,
  deliveryEarnings: 0,
  setDeliveryOnline: (deliveryOnline) => set({ deliveryOnline }),
  syncRevenue: async () => {
    const role = useAuthStore.getState().user?.role;
    if (!role) return;
    try {
      if (role === "admin") {
        const data = await dashboardService.getAdminDashboard();
        set({ adminRevenue: data.revenue });
      } else if (role === "vendor") {
        const data = await dashboardService.getVendorDashboard();
        set({ vendorRevenue: data.revenue });
      } else if (role === "delivery") {
        const data = await dashboardService.getDeliveryDashboard();
        set({ deliveryEarnings: data.completed * 50 }); // ₹50 per delivery
      }
    } catch {
      // keep previous values on error
    }
  },
}));
