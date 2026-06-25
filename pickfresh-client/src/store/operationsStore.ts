import { create } from "zustand";

type OperationsState = {
  vendorRevenue: number;
  adminRevenue: number;
  deliveryOnline: boolean;
  setDeliveryOnline: (value: boolean) => void;
};

export const useOperationsStore = create<OperationsState>()((set) => ({
  vendorRevenue: 184200,
  adminRevenue: 2845000,
  deliveryOnline: true,
  setDeliveryOnline: (deliveryOnline) => set({ deliveryOnline }),
}));
