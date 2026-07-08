import { Grid2X2, Menu, Moon, ShoppingCart, Sun, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BrandLogo } from "../components/BrandLogo";
import { NotificationDrawer } from "../components/NotificationDrawer";
import { cn } from "../lib/utils";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useThemeStore } from "../store/themeStore";
import { Avatar, Button, Dropdown, DropdownItem, SearchInput } from "../components/ui";
import { useSearchStore } from "../store/searchStore";
import { authService } from "../services/authService";
import { catalogService } from "../services/catalogService";
import type { UserRole } from "../types/domain";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/products" },
  { label: "Categories", to: "/categories" },
  { label: "Deals", to: "/deals" },
  { label: "Orders", to: "/orders" },
];

const authRouteForRole = (role: UserRole) =>
  role === "admin" ? "/admin" : role === "vendor" ? "/vendor" : role === "delivery" ? "/delivery" : "/";

export const CustomerLayout = () => {
  const navigate = useNavigate();
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const user = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const term = useSearchStore((state) => state.term);
  const setTerm = useSearchStore((state) => state.setTerm);
  const commit = useSearchStore((state) => state.commit);
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: catalogService.getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const handleLogout = async () => {
    try {
      await authService.logout(refreshToken);
    } catch {
      // Ignore failures
    }
    logoutStore();
    navigate("/login");
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [term]);

  // Operational users should not see Customer pages
  if (user && user.role !== "customer") {
    return <Navigate to={authRouteForRole(user.role)} replace />;
  }

  return (
    <div className="min-h-screen text-ink-950 dark:text-slate-100 flex flex-col bg-ink-50 dark:bg-ink-950">
      <header className="sticky top-0 z-40 border-b border-ink-200/50 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-ink-950/80">
        <div className="container-px flex min-h-20 items-center gap-4 py-3">
          <BrandLogo />
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3 py-1.5 text-sm font-semibold text-ink-500 transition-all duration-200 hover:bg-primary-50 hover:text-primary-700 dark:text-ink-100/75 dark:hover:bg-white/5 dark:hover:text-white",
                    isActive && "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-100"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden flex-1 max-w-md xl:block">
            <SearchInput
              value={term}
              onChange={setTerm}
              onSubmit={() => commit(term)}
              placeholder="Search mangoes, milk, organic vegetables"
            />
          </div>
          <Dropdown
            trigger={
              <Button variant="outline" className="hidden lg:inline-flex rounded-full border-ink-200 dark:border-white/10">
                <Grid2X2 className="h-4 w-4 text-primary-600" /> Categories
              </Button>
            }
          >
            {(categories.length > 0 ? categories : [{ id: "all", name: "All Categories" }]).map((cat) => (
              <DropdownItem
                key={cat.id}
                onSelect={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
              >
                {cat.name}
              </DropdownItem>
            ))}
          </Dropdown>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="rounded-full hover:bg-primary-50 dark:hover:bg-white/10 text-ink-500 dark:text-ink-100"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </Button>
            <NotificationDrawer />
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Open cart"
              className="relative rounded-full hover:bg-primary-50 dark:hover:bg-white/10 text-ink-500 dark:text-ink-100"
            >
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-citrus-500 px-1 text-[9px] font-black leading-none text-white ring-2 ring-white dark:ring-ink-950">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
            {user ? (
              <Dropdown
                trigger={
                  <button
                    aria-label="Open profile menu"
                    className="outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
                  >
                    <Avatar name={user.name} src={user.avatar} />
                  </button>
                }
              >
                <div className="px-3 py-2 border-b border-ink-100 dark:border-white/15">
                  <p className="text-xs text-ink-500 dark:text-ink-100/50">Logged in as</p>
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                </div>
                <DropdownItem onSelect={() => navigate("/profile")}>Profile</DropdownItem>
                <DropdownItem onSelect={handleLogout}>Logout</DropdownItem>
              </Dropdown>
            ) : (
              <Button asChild className="hidden sm:inline-flex rounded-full">
                <Link to="/login">
                  <UserRound className="h-4 w-4" /> Login
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden rounded-full border-ink-200 dark:border-white/10"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        <div className="container-px pb-3 xl:hidden">
          <SearchInput value={term} onChange={setTerm} onSubmit={() => commit(term)} placeholder="Search groceries" />
        </div>
        {menuOpen && (
          <div className="container-px pb-4 lg:hidden">
            <nav className="grid gap-2 rounded-3xl border border-ink-200 bg-white p-3 shadow-soft dark:border-white/10 dark:bg-ink-900 sm:grid-cols-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "rounded-2xl px-4 py-3 text-sm font-semibold text-ink-700 hover:bg-primary-50 hover:text-primary-700 dark:text-ink-100",
                      isActive && "bg-primary-600 text-white hover:bg-primary-600 hover:text-white"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {!user && (
                <Button asChild className="sm:hidden mt-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <UserRound className="h-4 w-4" /> Login
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-ink-200 bg-white py-10 dark:border-white/10 dark:bg-ink-950 mt-auto">
        <div className="container-px grid gap-8 md:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <BrandLogo />
            <p className="mt-4 max-w-sm text-sm muted-copy">
              Fresh produce, pantry essentials, fast delivery, and role-based operations in one polished marketplace.
            </p>
          </div>
          {["Shop", "Company", "Support", "Marketplace"].map((title) => (
            <div key={title}>
              <h3 className="font-bold">{title}</h3>
              <div className="mt-3 grid gap-2 text-sm muted-copy">
                <span>Fresh delivery</span>
                <span>Quality promise</span>
                <span>Partner portal</span>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};
