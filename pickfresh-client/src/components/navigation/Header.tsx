import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useNotificationStore } from "../../store/notificationStore";
import { Avatar, Button, Dropdown, DropdownItem } from "../ui";
import { Breadcrumbs } from "./Breadcrumbs";
import { cn } from "../../lib/utils";

type HeaderProps = {
  role: string;
  accentTextClass: string;
  onMenuClick: () => void;
};

export const Header = ({ role, accentTextClass, onMenuClick }: HeaderProps) => {
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const unreadCount = useNotificationStore((s) => s.items.filter((n) => !n.read).length);

  const handleLogout = () => {
    logoutStore();
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-ink-200/70 bg-white/95 px-4 dark:border-white/10 dark:bg-ink-900 sm:gap-3 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-lg lg:hidden"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumbs */}
      <div className="hidden sm:block">
        <Breadcrumbs />
      </div>

      <div className="flex-1" />

      {/* Search */}
      <button className="hidden w-44 items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-500 transition-colors hover:bg-primary-50 dark:border-white/10 dark:bg-ink-800 dark:text-ink-100/70 dark:hover:bg-white/10 md:flex lg:w-56">
        <Search className="h-4 w-4" />
        <span className="truncate">Search operations</span>
      </button>

      {/* Theme Toggler */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-lg"
        onClick={toggleTheme}
        aria-label="Toggle dark/light mode"
      >
        {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
      </Button>

      {/* Notifications */}
      <Link
        to={`/${role}/notifications`}
        className="relative rounded-lg p-2 transition-colors hover:bg-primary-50 dark:hover:bg-white/10"
        aria-label="View notifications"
      >
        <Bell className="h-5 w-5 text-ink-500 dark:text-ink-100/70" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">
            {unreadCount}
          </span>
        )}
      </Link>

      {/* Profile Menu Dropdown */}
      <Dropdown
        trigger={
          <button className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-primary-50 dark:hover:bg-white/10 sm:px-2">
            <Avatar name={user?.name ?? "U"} src={user?.avatar} />
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-ink-950 dark:text-white leading-none">{user?.name}</p>
              <p className={cn("text-[10px] font-semibold capitalize mt-0.5", accentTextClass)}>{role}</p>
            </div>
          </button>
        }
      >
        <div className="px-3 py-2 border-b border-ink-100 dark:border-white/15">
          <p className="text-xs text-ink-500 dark:text-ink-100/50">Logged in as</p>
          <p className="font-semibold text-sm truncate">{user?.name}</p>
        </div>
        <DropdownItem onSelect={handleLogout}>Logout</DropdownItem>
      </Dropdown>
    </header>
  );
};
