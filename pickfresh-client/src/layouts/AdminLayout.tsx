import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  BarChart2,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Package,
  Settings,
  Star,
  Ticket,
  Truck,
  Users,
  Image,
} from "lucide-react";
import { Sidebar, type SidebarMenuItem } from "../components/navigation/Sidebar";
import { Header } from "../components/navigation/Header";

const adminNav: SidebarMenuItem[] = [
  { label: "Dashboard", to: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Products", to: "/admin/products", icon: <Package className="h-5 w-5" /> },
  { label: "Categories", to: "/admin/categories", icon: <Boxes className="h-5 w-5" /> },
  { label: "Orders", to: "/admin/orders", icon: <ClipboardList className="h-5 w-5" /> },
  { label: "Customers", to: "/admin/customers", icon: <Users className="h-5 w-5" /> },
  { label: "Vendors", to: "/admin/vendors", icon: <Users className="h-5 w-5" /> },
  { label: "Delivery Partners", to: "/admin/delivery", icon: <Truck className="h-5 w-5" /> },
  { label: "Coupons", to: "/admin/coupons", icon: <Ticket className="h-5 w-5" /> },
  { label: "Banners", to: "/admin/banners", icon: <Image className="h-5 w-5" /> },
  { label: "Reports", to: "/admin/reports", icon: <BarChart2 className="h-5 w-5" /> },
  { label: "Reviews", to: "/admin/reviews", icon: <Star className="h-5 w-5" /> },
  { label: "Settings", to: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
];

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50 dark:bg-ink-950 text-ink-950 dark:text-white">
      <Sidebar
        menuItems={adminNav}
        role="admin"
        accentClass="bg-primary-600 text-white"
        accentLightClass="bg-primary-50 dark:bg-primary-500/15"
        accentTextClass="text-primary-700 dark:text-primary-100"
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          role="admin"
          accentTextClass="text-primary-700 dark:text-primary-100"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
