import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const refreshToken = useAuthStore.getState().refreshToken;

    if (status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;
      const response = await api.post("/auth/refresh-token", { refreshToken });
      useAuthStore.getState().setToken(response.data.data.token);
      originalRequest.headers.Authorization = `Bearer ${response.data.data.token}`;
      return api(originalRequest);
    }

    toast.error(error.response?.data?.message ?? "Something went wrong");
    return Promise.reject(error);
  },
);
