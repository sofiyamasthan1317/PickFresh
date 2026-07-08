import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useThemeStore } from "../store/themeStore";
import { useWishlistStore } from "../store/wishlistStore";
import { useNotificationStore } from "../store/notificationStore";

export const AppLayout = () => {
  const user = useAuthStore((state) => state.user);
  const theme = useThemeStore((state) => state.theme);
  const syncCart = useCartStore((state) => state.syncFromBackend);
  const syncWishlist = useWishlistStore((state) => state.syncFromBackend);
  const syncNotifications = useNotificationStore((state) => state.syncFromBackend);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (user) {
      void syncCart();
      void syncWishlist();
      void syncNotifications();
    }
  }, [syncCart, syncWishlist, syncNotifications, user]);

  return (
    <>
      <Outlet />
    </>
  );
};
