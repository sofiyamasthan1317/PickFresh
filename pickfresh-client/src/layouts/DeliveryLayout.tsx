import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Bike, ClipboardCheck, LayoutDashboard, DollarSign, User } from "lucide-react";
import { Sidebar, type SidebarMenuItem } from "../components/navigation/Sidebar";
import { Header } from "../components/navigation/Header";

const deliveryNav: SidebarMenuItem[] = [
  { label: "Dashboard", to: "/delivery", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Assigned Orders", to: "/delivery/orders", icon: <Bike className="h-5 w-5" /> },
  { label: "History", to: "/delivery/history", icon: <ClipboardCheck className="h-5 w-5" /> },
  { label: "Earnings", to: "/delivery/earnings", icon: <DollarSign className="h-5 w-5" /> },
  { label: "Profile", to: "/delivery/profile", icon: <User className="h-5 w-5" /> },
];

export const DeliveryLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50 dark:bg-ink-950 text-ink-950 dark:text-white">
      <Sidebar
        menuItems={deliveryNav}
        role="delivery"
        accentClass="bg-primary-600 text-white"
        accentLightClass="bg-primary-50 dark:bg-primary-500/15"
        accentTextClass="text-primary-700 dark:text-primary-100"
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          role="delivery"
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
