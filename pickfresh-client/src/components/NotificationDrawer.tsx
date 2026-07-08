import { Bell, CheckCheck, Circle, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../store/notificationStore";
import { Badge, Button, Drawer, EmptyState, Input, LoadingState } from "./ui";

const iconMap: Record<string, string> = {
  order: "📦",
  payment: "💳",
  promotion: "🎁",
  system: "⚙️",
  review: "⭐",
  chat: "💬",
  delivery: "🚚",
  coupon: "🏷️",
};

export const NotificationDrawer = () => {
  const items = useNotificationStore((state) => state.items);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isSyncing = useNotificationStore((state) => state.isSyncing);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const markOneRead = useNotificationStore((state) => state.markOneRead);
  const remove = useNotificationStore((state) => state.remove);
  const clearAll = useNotificationStore((state) => state.clearAll);
  const syncFromBackend = useNotificationStore((state) => state.syncFromBackend);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    void syncFromBackend(1, 20, filter);
  }, [syncFromBackend, filter]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery = !query || `${item.title} ${item.body}`.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "all" || (filter === "unread" ? !item.read : filter === "read" ? item.read : item.type === filter);
      return matchesQuery && matchesFilter;
    });
  }, [filter, items, query]);

  const handleOpen = (item: { id: string; title: string; body: string; read: boolean; type?: string; referenceId?: string; referenceType?: string }) => {
    if (!item.read) void markOneRead(item.id);
    if (item.type === "order" && item.referenceId) navigate(`/orders/${item.referenceId}`);
    if (item.type === "coupon" || item.referenceType === "coupon") navigate("/coupons");
    if (item.type === "delivery" || item.referenceType === "delivery") navigate("/orders");
    if (item.type === "chat") navigate("/chat");
  };

  return (
    <Drawer
      title="Notifications"
      trigger={
        <Button variant="ghost" size="icon" aria-label="Open notifications" className="relative rounded-full hover:bg-primary-50 dark:hover:bg-white/10 text-ink-500 dark:text-ink-100">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-citrus-500 ring-2 ring-white dark:ring-ink-950" />}
        </Button>
      }
    >
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Badge>{unreadCount} unread</Badge>
          <div className="flex gap-2">
            {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={() => void markAllRead()}><CheckCheck className="mr-1 h-3.5 w-3.5" />Mark all read</Button>}
            <Button variant="ghost" size="sm" onClick={() => void clearAll()}>Clear</Button>
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notifications" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "unread", "read", "order", "payment", "delivery", "promotion", "chat", "review", "system", "coupon"]).map((value) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === value ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}>
              {value === "all" ? "All" : value === "unread" ? "Unread" : value === "read" ? "Read" : value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {isSyncing && <LoadingState />}
      {!isSyncing && filteredItems.length === 0 && <EmptyState title="No notifications" body="You are all caught up or the filters do not match any items." />}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <article
            key={item.id}
            onClick={() => handleOpen(item)}
            className={`cursor-pointer rounded-2xl border p-4 transition duration-200 hover:border-primary-200 dark:hover:border-primary-500/30 ${item.read ? "border-ink-200 dark:border-white/10" : "border-primary-200 bg-primary-50/50 dark:border-primary-500/20 dark:bg-primary-500/10"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{iconMap[item.type ?? "system"] ?? "🔔"}</span>
                  <h3 className="font-semibold text-ink-950 dark:text-white">{item.title}</h3>
                </div>
                <p className="mt-1 text-sm muted-copy">{item.body}</p>
                <p className="mt-2 text-xs text-ink-400 dark:text-ink-100/40">{item.createdAt}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {!item.read && <Circle className="h-2.5 w-2.5 fill-primary-600 text-primary-600" />}
                <button aria-label="Delete notification" onClick={(event) => { event.stopPropagation(); void remove(item.id); }} className="rounded-full p-1 text-ink-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Drawer>
  );
};
