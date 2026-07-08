import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, LogOut, X } from "lucide-react";
import { type ReactNode, useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BrandLogo } from "../BrandLogo";
import { Avatar } from "../ui";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";

export type SidebarMenuItem = {
  label: string;
  to: string;
  icon: ReactNode;
  badge?: string;
};

type SidebarProps = {
  menuItems: SidebarMenuItem[];
  role: string;
  accentClass: string;
  accentLightClass: string;
  accentTextClass: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export const Sidebar = ({
  menuItems,
  role,
  accentClass,
  accentLightClass,
  accentTextClass,
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  const handleLogout = () => {
    logoutStore();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand logo & role badge */}
      <div
        className={cn(
          "flex min-h-20 flex-col items-start justify-center gap-2 border-b border-ink-200/70 px-4 py-3 dark:border-white/10",
          sidebarCollapsed && "min-h-16 items-center px-3",
        )}
      >
        <BrandLogo iconOnly={sidebarCollapsed} />
        {!sidebarCollapsed && (
          <span className={cn("ml-14 rounded-md px-2 py-1 text-xs font-bold uppercase tracking-normal leading-none", accentLightClass, accentTextClass)}>
            {role}
          </span>
        )}
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === `/${role}`}
            className={({ isActive }) =>
              cn(
                "group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200",
                "text-ink-600 hover:bg-primary-50 hover:text-primary-800 dark:text-ink-100/75 dark:hover:bg-white/10 dark:hover:text-white",
                isActive && cn("shadow-sm", accentClass),
                sidebarCollapsed && "justify-center px-0",
              )
            }
            title={sidebarCollapsed ? item.label : undefined}
          >
            <span className="h-5 w-5 shrink-0">{item.icon}</span>
            {!sidebarCollapsed && <span className="flex-1">{item.label}</span>}
            {!sidebarCollapsed && item.badge && (
              <span className="rounded-full bg-citrus-500 px-1.5 py-0.5 text-[10px] font-black leading-none text-white">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile footer */}
      <div className={cn("border-t border-ink-200/70 p-3 dark:border-white/10", sidebarCollapsed && "flex justify-center")}>
        {sidebarCollapsed ? (
          <button
            onClick={handleLogout}
            className="rounded-lg p-2.5 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-primary-50 dark:hover:bg-white/5">
            <Avatar name={user?.name ?? "U"} src={user?.avatar} />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-bold text-ink-950 dark:text-white">{user?.name}</p>
              <p className="truncate text-xs muted-copy">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 68 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative z-30 hidden shrink-0 flex-col border-r border-ink-200/70 bg-white/95 dark:border-white/10 dark:bg-ink-900 lg:flex"
      >
        <button
          onClick={() => setSidebarCollapsed((v) => !v)}
          className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-ink-200 bg-white shadow-sm transition-colors hover:bg-primary-50 dark:border-white/10 dark:bg-ink-800 dark:hover:bg-ink-700"
          aria-label="Collapse sidebar"
        >
          <ChevronRight className={cn("h-3 w-3 text-ink-500 transition-transform duration-200", sidebarCollapsed && "rotate-180")} />
        </button>
        <SidebarContent />
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink-950/55 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar menu drawer */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed left-0 top-0 z-50 h-full w-[min(18rem,86vw)] border-r border-ink-200/70 bg-white dark:border-white/10 dark:bg-ink-900 lg:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-2 hover:bg-primary-50 dark:hover:bg-white/10"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
