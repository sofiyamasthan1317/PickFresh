import { api } from "./api";

export type CouponResult = {
  code: string;
  discount: number;
  payableAmount: number;
};

export const couponService = {
  // POST /coupons/validate
  async validateCoupon(code: string, amount: number): Promise<CouponResult> {
    const response = await api.post("/coupons/validate", { code, amount });
    return response.data.data;
  },

  // POST /coupons/apply
  async applyCoupon(code: string, amount: number): Promise<CouponResult> {
    const response = await api.post("/coupons/apply", { code, amount });
    return response.data.data;
  },
};
