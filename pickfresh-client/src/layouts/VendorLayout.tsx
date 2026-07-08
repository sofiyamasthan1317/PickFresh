import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Boxes,
  ClipboardList,
  DollarSign,
  LayoutDashboard,
  Package,
  Star,
  PlusCircle,
  User,
} from "lucide-react";
import { Sidebar, type SidebarMenuItem } from "../components/navigation/Sidebar";
import { Header } from "../components/navigation/Header";

const vendorNav: SidebarMenuItem[] = [
  { label: "Dashboard", to: "/vendor", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "My Products", to: "/vendor/products", icon: <Package className="h-5 w-5" /> },
  { label: "Add Product", to: "/vendor/add-product", icon: <PlusCircle className="h-5 w-5" /> },
  { label: "Inventory", to: "/vendor/inventory", icon: <Boxes className="h-5 w-5" /> },
  { label: "Orders", to: "/vendor/orders", icon: <ClipboardList className="h-5 w-5" /> },
  { label: "Reviews", to: "/vendor/reviews", icon: <Star className="h-5 w-5" /> },
  { label: "Earnings", to: "/vendor/earnings", icon: <DollarSign className="h-5 w-5" /> },
  { label: "Profile", to: "/vendor/profile", icon: <User className="h-5 w-5" /> },
];

export const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50 dark:bg-ink-950 text-ink-950 dark:text-white">
      <Sidebar
        menuItems={vendorNav}
        role="vendor"
        accentClass="bg-primary-600 text-white"
        accentLightClass="bg-primary-50 dark:bg-primary-500/15"
        accentTextClass="text-primary-700 dark:text-primary-100"
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          role="vendor"
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
