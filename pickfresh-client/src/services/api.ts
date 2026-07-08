import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

// Request interceptor: attach authorization token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: automatically refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const refreshToken = useAuthStore.getState().refreshToken;

    if (status === 304 && originalRequest?.method?.toLowerCase() === "get" && !originalRequest._cacheRetry) {
      originalRequest._cacheRetry = true;
      originalRequest.params = { ...(originalRequest.params || {}), _ts: Date.now() };
      return api(originalRequest);
    }

    // If 401 Unauthorized, try to refresh token
    if (status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Use standard axios to avoid infinite loops if the interceptor intercepts the refresh call
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          { refreshToken }
        );
        const newToken = response.data.data.token;
        const newRefreshToken = response.data.data.refreshToken;
        
        // Update store with new token & refresh token
        useAuthStore.getState().setToken(newToken, newRefreshToken);
        
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed/expired: log user out
        useAuthStore.getState().logout();
        toast.error("Session expired. Please log in again.");
        return Promise.reject(refreshError);
      }
    } else if (status === 401) {
      // 401 and no refresh token available: log out
      useAuthStore.getState().logout();
    }

    // Capture backend custom message or fallback
    const message = error.response?.data?.message ?? "Something went wrong";
    
    // Do not show error toast for validation errors (handled in components)
    if (status !== 422) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);
