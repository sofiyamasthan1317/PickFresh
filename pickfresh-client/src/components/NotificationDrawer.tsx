import { Bell } from "lucide-react";
import { useNotificationStore } from "../store/notificationStore";
import { Badge, Button, Drawer } from "./ui";

export const NotificationDrawer = () => {
  const items = useNotificationStore((state) => state.items);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const unread = items.filter((item) => !item.read).length;

  return (
    <Drawer
      title="Notifications"
      trigger={
        <Button variant="ghost" size="icon" aria-label="Open notifications" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-citrus-500" />}
        </Button>
      }
    >
      <div className="mb-4 flex items-center justify-between">
        <Badge>{unread} unread</Badge>
        <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">{item.title}</h3>
              {!item.read && <span className="h-2 w-2 rounded-full bg-primary-600" />}
            </div>
            <p className="mt-1 text-sm muted-copy">{item.body}</p>
            <p className="mt-2 text-xs text-slate-400">{item.createdAt}</p>
          </article>
        ))}
      </div>
    </Drawer>
  );
};
