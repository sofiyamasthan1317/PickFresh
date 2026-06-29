import { api } from "./api";
import type { LoginForm, SignupForm } from "../features/auth/validation/authSchemas";

export type OtpPurpose = "email-verify" | "forgot-password";

export interface SendOtpPayload {
  email: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  avatar?: string;
}

export const authService = {
  // POST /auth/register
  async register(values: SignupForm) {
    const response = await api.post("/auth/register", values);
    return response.data;
  },

  // POST /auth/login
  async login(values: LoginForm) {
    const response = await api.post("/auth/login", values);
    return response.data;
  },

  // POST /auth/logout
  async logout(refreshToken: string | null) {
    const response = await api.post("/auth/logout", { refreshToken });
    return response.data;
  },

  // GET /auth/me
  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // POST /auth/send-otp
  async sendOtp(payload: SendOtpPayload) {
    const response = await api.post("/auth/send-otp", payload);
    return response.data;
  },

  // POST /auth/verify-otp
  async verifyOtp(payload: VerifyOtpPayload) {
    const response = await api.post("/auth/verify-otp", payload);
    return response.data;
  },

  // POST /auth/resend-otp
  async resendOtp(payload: SendOtpPayload) {
    const response = await api.post("/auth/resend-otp", payload);
    return response.data;
  },

  // POST /auth/forgot-password
  async forgotPassword(email: string) {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // POST /auth/reset-password
  async resetPassword(payload: ResetPasswordPayload) {
    const response = await api.post("/auth/reset-password", payload);
    return response.data;
  },

  // POST /auth/change-password
  async changePassword(payload: ChangePasswordPayload) {
    const response = await api.post("/auth/change-password", payload);
    return response.data;
  },

  // PUT /users/profile
  async updateProfile(payload: UpdateProfilePayload) {
    const response = await api.put("/users/profile", payload);
    return response.data;
  },

  // PATCH /users/profile
  async patchProfile(payload: UpdateProfilePayload) {
    const response = await api.patch("/users/profile", payload);
    return response.data;
  },
};
