import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, ChevronRight, LogOut, Menu, Moon, Search, Sun, X,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { Avatar, Button } from "../components/ui";
import { cn } from "../lib/utils";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import { useThemeStore } from "../store/themeStore";
import { useEffect } from "react";

export type NavItem = {
  label: string;
  to: string;
  icon: ReactNode;
  badge?: string;
};

type RoleLayoutProps = {
  navItems: NavItem[];
  role: string;
  accentClass: string;        // e.g. "bg-primary-600"
  accentLightClass: string;   // e.g. "bg-primary-50 dark:bg-primary-500/15"
  accentTextClass: string;    // e.g. "text-primary-600"
};

export const RoleLayout = ({ navItems, role, accentClass, accentLightClass, accentTextClass }: RoleLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const unreadCount = useNotificationStore((s) => s.items.filter((n) => !n.read).length);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Close mobile sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    try { await authService.logout(refreshToken); } catch { /* ignore */ }
    logoutStore();
    navigate("/login");
  };

  // Build breadcrumb from pathname
  const crumbs = location.pathname.split("/").filter(Boolean);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-ink-200/60 dark:border-white/10", sidebarCollapsed && "justify-center px-3")}>
        <BrandLogo iconOnly={sidebarCollapsed} />
        {!sidebarCollapsed && (
          <span className={cn("text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full", accentLightClass, accentTextClass)}>
            {role}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split("/").length <= 2}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 group",
                "text-ink-600 hover:bg-ink-100 hover:text-ink-950 dark:text-ink-100/70 dark:hover:bg-white/10 dark:hover:text-white",
                isActive && cn("text-white", accentClass),
                sidebarCollapsed && "justify-center px-0",
              )
            }
            title={sidebarCollapsed ? item.label : undefined}
          >
            <span className="h-5 w-5 shrink-0">{item.icon}</span>
            {!sidebarCollapsed && <span className="flex-1">{item.label}</span>}
            {!sidebarCollapsed && item.badge && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white leading-none">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className={cn("border-t border-ink-200/60 dark:border-white/10 p-3", sidebarCollapsed && "flex justify-center")}>
        {sidebarCollapsed ? (
          <button onClick={handleLogout} className="rounded-2xl p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Logout">
            <LogOut className="h-5 w-5" />
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl p-2 hover:bg-ink-100 dark:hover:bg-white/5 transition-colors">
            <Avatar name={user?.name ?? "U"} src={user?.avatar} />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-bold text-ink-950 dark:text-white">{user?.name}</p>
              <p className="truncate text-xs muted-copy">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="rounded-xl p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50 dark:bg-ink-950 text-ink-950 dark:text-white">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 68 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden lg:flex flex-col relative z-30 bg-white dark:bg-ink-900 border-r border-ink-200/60 dark:border-white/10 shrink-0"
      >
        <button
          onClick={() => setSidebarCollapsed((v) => !v)}
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-ink-800 border border-ink-200 dark:border-white/10 shadow-sm hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
        >
          <ChevronRight className={cn("h-3 w-3 text-ink-500 transition-transform duration-200", sidebarCollapsed && "rotate-180")} />
        </button>
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink-950/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-white dark:bg-ink-900 border-r border-ink-200/60 dark:border-white/10 lg:hidden"
            >
              <button onClick={() => setSidebarOpen(false)} className="absolute right-4 top-4 rounded-full p-2 hover:bg-ink-100 dark:hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-ink-200/60 dark:border-white/10 bg-white dark:bg-ink-900 px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden rounded-xl" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumb */}
          <nav className="hidden sm:flex items-center gap-1.5 text-sm">
            {crumbs.map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-400" />}
                <span className={cn("capitalize font-medium", i === crumbs.length - 1 ? "text-ink-950 dark:text-white" : "text-ink-400 dark:text-ink-100/50")}>
                  {crumb.replace(/-/g, " ")}
                </span>
              </span>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Search */}
          <button className="hidden sm:flex items-center gap-2 rounded-2xl border border-ink-200 dark:border-white/10 bg-ink-50 dark:bg-ink-800 px-3 py-2 text-sm text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors w-48">
            <Search className="h-4 w-4" />
            <span>Search...</span>
          </button>

          {/* Theme */}
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          <Link to={`/${role}/notifications`} className="relative rounded-xl p-2 hover:bg-ink-100 dark:hover:bg-white/10 transition-colors">
            <Bell className="h-5 w-5 text-ink-500 dark:text-ink-100/70" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link to={`/${role}/profile`} className="flex items-center gap-2 rounded-2xl px-2 py-1.5 hover:bg-ink-100 dark:hover:bg-white/10 transition-colors">
            <Avatar name={user?.name ?? "U"} src={user?.avatar} />
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-ink-950 dark:text-white leading-none">{user?.name}</p>
              <p className={cn("text-[10px] font-semibold capitalize mt-0.5", accentTextClass)}>{role}</p>
            </div>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
