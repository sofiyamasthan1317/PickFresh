import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const push = useNotificationStore((state) => state.push);
  const refreshUnreadCount = useNotificationStore((state) => state.refreshUnreadCount);

  const instance = useMemo(() => {
    if (!token) return null;
    const client = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    return client;
  }, [token]);

  useEffect(() => {
    if (!instance || !isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }

    socketRef.current?.disconnect();
    socketRef.current = instance;
    setSocket(instance);
    instance.connect();

    instance.on("connect", () => {
      toast.success("Realtime sync connected");
    });

    instance.on("notification", (data: any) => {
      push({
        id: data._id ?? `${Date.now()}`,
        title: data.title ?? "New update",
        body: data.message ?? "",
        read: data.isRead ?? false,
        createdAt: data.createdAt ? new Date(data.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit" }) : "Just now",
        type: data.type,
        priority: data.priority,
      });
      void refreshUnreadCount();
    });

    instance.on("connect_error", () => {
      toast.error("Realtime connection lost");
    });

    return () => {
      instance.off("connect");
      instance.off("notification");
      instance.off("connect_error");
      instance.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [instance, isAuthenticated, push, refreshUnreadCount]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
