import { Bike, Boxes, ClipboardList, DollarSign, Headphones, Package, Settings, Shield, Ticket, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Seo } from "../../../components/Seo";
import { Badge, Button, Card, Tabs } from "../../../components/ui";
import { currency } from "../../../lib/utils";
import { useOperationsStore } from "../../../store/operationsStore";

const chartData = [
  { name: "Mon", orders: 120, revenue: 24000 },
  { name: "Tue", orders: 160, revenue: 32000 },
  { name: "Wed", orders: 130, revenue: 28000 },
  { name: "Thu", orders: 210, revenue: 42000 },
  { name: "Fri", orders: 240, revenue: 52000 },
  { name: "Sat", orders: 300, revenue: 68000 },
];

export const VendorDashboardPage = () => (
  <DashboardShell title="Vendor portal" description="Products, categories, orders, customers, coupons, inventory, payout, reviews and profile settings.">
    <Tabs tabs={[
      { value: "dashboard", label: "Dashboard", content: <AnalyticsGrid type="vendor" /> },
      { value: "products", label: "Products", content: <ResourcePanel title="Products" icon={<Package />} items={["Organic Tomato", "A2 Cow Milk", "Sourdough Bread"]} /> },
      { value: "categories", label: "Categories", content: <ResourcePanel title="Categories" icon={<Boxes />} items={["Vegetables", "Dairy", "Bakery"]} /> },
      { value: "orders", label: "Orders", content: <ResourcePanel title="Orders" icon={<ClipboardList />} items={["PF-2026-1042", "PF-2026-0995"]} /> },
      { value: "customers", label: "Customers", content: <ResourcePanel title="Customers" icon={<Users />} items={["Sofiya Khan", "Aarav Mehta"]} /> },
      { value: "payout", label: "Payout", content: <Card className="p-6">Next payout: {currency(84200)}. Stripe-style payout reconciliation ready.</Card> },
      { value: "settings", label: "Settings", content: <SettingsPanel /> },
    ]} />
  </DashboardShell>
);

export const AdminDashboardPage = () => (
  <DashboardShell title="Admin command center" description="Revenue, users, vendors, products, inventory, coupons, banners, offers, tickets, reports, settings and audit logs.">
    <Tabs tabs={[
      { value: "dashboard", label: "Dashboard", content: <AnalyticsGrid type="admin" /> },
      { value: "users", label: "Users", content: <ResourcePanel title="Users" icon={<Users />} items={["Customers", "Vendors", "Admins", "Delivery partners"]} /> },
      { value: "inventory", label: "Inventory", content: <ResourcePanel title="Inventory" icon={<Boxes />} items={["Low stock alerts", "Expired batches", "Vendor submissions"]} /> },
      { value: "coupons", label: "Coupons", content: <ResourcePanel title="Coupons" icon={<Ticket />} items={["FRESH10", "WELCOME100", "FLASH35"]} /> },
      { value: "support", label: "Support", content: <ResourcePanel title="Support tickets" icon={<Headphones />} items={["Refund request", "Late delivery", "Vendor onboarding"]} /> },
      { value: "reports", label: "Reports", content: <Card className="p-6">Revenue, fulfillment, retention, vendor scorecards and audit logs.</Card> },
      { value: "settings", label: "Settings", content: <SettingsPanel /> },
    ]} />
  </DashboardShell>
);

export const DeliveryDashboardPage = () => {
  const online = useOperationsStore((state) => state.deliveryOnline);
  const setOnline = useOperationsStore((state) => state.setDeliveryOnline);

  return (
    <DashboardShell title="Delivery dashboard" description="Assigned, accepted and completed orders with live tracking UI, navigation placeholder, earnings and availability.">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Tabs tabs={[
          { value: "assigned", label: "Assigned", content: <ResourcePanel title="Assigned orders" icon={<Bike />} items={["PF-2026-1042 - 2.4 km", "PF-2026-1050 - 4.1 km"]} /> },
          { value: "accepted", label: "Accepted", content: <ResourcePanel title="Accepted orders" icon={<ClipboardList />} items={["PF-2026-1042"]} /> },
          { value: "completed", label: "Completed", content: <ResourcePanel title="Completed orders" icon={<Package />} items={["PF-2026-0995", "PF-2026-0977"]} /> },
          { value: "tracking", label: "Live tracking", content: <Card className="h-80 p-6"><Bike className="h-10 w-10 text-primary-600" /><p className="mt-4 font-bold">Navigation placeholder</p><p className="text-sm muted-copy">Map SDK can be connected here.</p></Card> },
        ]} />
        <Card className="h-fit p-6">
          <Badge>{online ? "Available" : "Offline"}</Badge>
          <h2 className="mt-4 text-2xl font-black">{currency(3200)} earnings</h2>
          <p className="mt-2 text-sm muted-copy">Today's delivery earnings and performance.</p>
          <Button className="mt-5 w-full" variant={online ? "danger" : "primary"} onClick={() => setOnline(!online)}>{online ? "Go offline" : "Go online"}</Button>
        </Card>
      </div>
    </DashboardShell>
  );
};

const DashboardShell = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <section className="container-px py-8">
    <Seo title={title} description={description} />
    <div className="mb-6 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Card className="h-fit p-5">
        <div className="flex items-center gap-3"><Shield className="h-6 w-6 text-primary-600" /><span className="font-black">PickFresh Ops</span></div>
        <div className="mt-5 grid gap-2 text-sm muted-copy">{["Dashboard", "Analytics", "Orders", "Inventory", "Settings"].map((item) => <span key={item} className="rounded-xl p-2 hover:bg-primary-50 dark:hover:bg-white/10">{item}</span>)}</div>
      </Card>
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="mt-2 muted-copy">{description}</p>
      </div>
    </div>
    {children}
  </section>
);

const AnalyticsGrid = ({ type }: { type: "vendor" | "admin" }) => {
  const vendorRevenue = useOperationsStore((state) => state.vendorRevenue);
  const adminRevenue = useOperationsStore((state) => state.adminRevenue);
  const revenue = type === "admin" ? adminRevenue : vendorRevenue;

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        {[["Revenue", currency(revenue), DollarSign], ["Orders", "1,248", ClipboardList], ["Customers", "8,420", Users], ["Inventory", "92%", Boxes]].map(([label, value, Icon]) => (
          <Card key={String(label)} className="p-5"><Icon className="h-6 w-6 text-primary-600" /><p className="mt-4 text-2xl font-black">{String(value)}</p><p className="text-sm muted-copy">{String(label)}</p></Card>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5"><h3 className="mb-4 font-bold">Revenue trend</h3><ResponsiveContainer width="100%" height={260}><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area dataKey="revenue" stroke="#16a34a" fill="#bbf7d0" /></AreaChart></ResponsiveContainer></Card>
        <Card className="p-5"><h3 className="mb-4 font-bold">Orders</h3><ResponsiveContainer width="100%" height={260}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="orders" fill="#f97316" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></Card>
      </div>
    </div>
  );
};

const ResourcePanel = ({ title, icon, items }: { title: string; icon: ReactNode; items: string[] }) => (
  <Card className="p-6">
    <div className="mb-5 flex items-center gap-3 text-primary-700">{icon}<h2 className="text-2xl font-black text-slate-950 dark:text-white">{title}</h2></div>
    <div className="grid gap-3">{items.map((item) => <div key={item} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 dark:border-white/10"><span>{item}</span><Button variant="outline" size="sm">Manage</Button></div>)}</div>
  </Card>
);

const SettingsPanel = () => <Card className="p-6"><Settings className="h-8 w-8 text-primary-600" /><h2 className="mt-4 text-2xl font-black">Settings and profile</h2><p className="mt-2 muted-copy">Profile, permissions, payout preferences, audit logs, notification settings and security controls.</p></Card>;
