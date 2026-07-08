import { useEffect, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { Boxes, CheckCircle, ClipboardList, DollarSign, Package, Settings, Shield, Ticket, Trash2, TrendingUp, Users } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import toast from "react-hot-toast";
import { Seo } from "../../../components/Seo";
import { Badge, Button, Card, ConfirmDialog, EmptyState, LoadingState, Select, Tabs } from "../../../components/ui";
import { currency } from "../../../lib/utils";
import { dashboardService } from "../../../services/dashboardService";
import { deliveryService, type DeliveryOrder } from "../../../services/deliveryService";
import { userService, type UserListItem } from "../../../services/userService";
import { useOperationsStore } from "../../../store/operationsStore";

// ─── Shared shell ─────────────────────────────────────────────────────────────

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

const StatCard = ({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) => (
  <Card className="p-5">
    <Icon className="h-6 w-6 text-primary-600" />
    <p className="mt-4 text-2xl font-black">{value}</p>
    <p className="text-sm muted-copy">{label}</p>
  </Card>
);

// ─── Admin dashboard ──────────────────────────────────────────────────────────

const AdminAnalytics = () => {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard", "admin"], queryFn: dashboardService.getAdminDashboard });

  if (isLoading) return <LoadingState />;
  if (!data) return null;

  const topCategoriesChart = data.topCategories.map((c) => ({ name: c.name, revenue: c.revenue, orders: c.orders }));

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={DollarSign} label="Revenue" value={currency(data.revenue)} />
        <StatCard icon={ClipboardList} label="Total orders" value={String(data.orders.total)} />
        <StatCard icon={Users} label="Customers" value={String(data.users.total)} />
        <StatCard icon={Boxes} label="Products" value={String(data.products)} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={TrendingUp} label="Pending" value={String(data.orders.pending)} />
        <StatCard icon={CheckCircle} label="Delivered" value={String(data.orders.delivered)} />
        <StatCard icon={Boxes} label="Vendors" value={String(data.users.vendors)} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 font-bold">Top categories by revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={topCategoriesChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Area dataKey="revenue" stroke="#16a34a" fill="#bbf7d0" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="mb-4 font-bold">Top categories by orders</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topCategoriesChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card className="p-5">
        <h3 className="mb-4 font-bold">Recent orders</h3>
        {data.recentOrders.length === 0 && <EmptyState title="No orders yet" body="Recent orders will appear here." />}
        <div className="grid gap-3">
          {data.recentOrders.map((order: any) => (
            <div key={order._id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-200 p-4 dark:border-white/10">
              <div><p className="font-bold text-sm">{order.orderId}</p><p className="text-xs muted-copy">{order.user?.name ?? "—"} · {order.user?.email ?? ""}</p></div>
              <Badge>{order.orderStatus}</Badge>
              <span className="font-black text-sm">{currency(order.totalAmount ?? 0)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const AdminUserTable = () => {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users", roleFilter, page],
    queryFn: () => userService.getAllUsers(page, 20),
  });

  const filtered = roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await userService.updateUserRole(id, role);
      toast.success("Role updated");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch {
      // toast shown by interceptor
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userService.deleteUser(id);
      toast.success("User deleted");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch {
      // toast shown by interceptor
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-ink-200 dark:border-white/10">
        <h2 className="font-black">User management</h2>
        <Select value={roleFilter} onValueChange={setRoleFilter} options={["all", "customer", "vendor", "delivery", "admin"]} placeholder="Filter by role" />
      </div>
      {filtered.length === 0 && <div className="p-6"><EmptyState title="No users" body="No users found for this filter." /></div>}
      <div className="divide-y divide-ink-100 dark:divide-white/10">
        {filtered.map((user) => <UserRow key={user.id} user={user} onRoleChange={handleRoleChange} onDelete={handleDelete} />)}
      </div>
      <div className="flex justify-between items-center p-4">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <span className="text-sm muted-copy">Page {page}</span>
        <Button variant="outline" size="sm" disabled={users.length < 20} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </Card>
  );
};

const UserRow = ({ user, onRoleChange, onDelete }: { user: UserListItem; onRoleChange: (id: string, role: string) => void; onDelete: (id: string) => void }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 p-4">
    <div>
      <p className="font-semibold text-sm">{user.name}</p>
      <p className="text-xs muted-copy">{user.email} · {user.createdAt}</p>
    </div>
    <div className="flex items-center gap-3">
      <Select value={user.role} onValueChange={(role) => onRoleChange(user.id, role)} options={["customer", "vendor", "delivery", "admin"]} placeholder="Role" />
      <ConfirmDialog
        title={`Delete ${user.name}?`}
        onConfirm={() => onDelete(user.id)}
        trigger={<Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>}
      />
    </div>
  </div>
);

export const AdminDashboardPage = () => (
  <DashboardShell title="Admin command center" description="Revenue, users, vendors, products, inventory, coupons, support tickets and reports.">
    <Tabs tabs={[
      { value: "dashboard", label: "Dashboard", content: <AdminAnalytics /> },
      { value: "users", label: "Users", content: <AdminUserTable /> },
      { value: "coupons", label: "Coupons", content: <PlaceholderPanel title="Coupons" icon={<Ticket />} body="Coupon management: create, expire, usage stats." /> },
      { value: "reports", label: "Reports", content: <PlaceholderPanel title="Reports" icon={<TrendingUp />} body="Revenue, fulfilment, retention and vendor scorecards." /> },
      { value: "settings", label: "Settings", content: <SettingsPanel /> },
    ]} />
  </DashboardShell>
);

// ─── Vendor dashboard ─────────────────────────────────────────────────────────

const VendorAnalytics = () => {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard", "vendor"], queryFn: dashboardService.getVendorDashboard });
  const syncRevenue = useOperationsStore((s) => s.syncRevenue);

  useEffect(() => { void syncRevenue(); }, [syncRevenue]);

  if (isLoading) return <LoadingState />;
  if (!data) return null;

  const orderChart = data.orders.map((o) => ({ name: o._id, orders: o.count }));

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={DollarSign} label="Revenue" value={currency(data.revenue)} />
        <StatCard icon={Package} label="Total products" value={String(data.products.total)} />
        <StatCard icon={Boxes} label="Out of stock" value={String(data.products.outOfStock)} />
      </div>
      <Card className="p-5">
        <h3 className="mb-4 font-bold">Orders by status</h3>
        {orderChart.length === 0
          ? <EmptyState title="No orders yet" body="Order data will appear here." />
          : <ResponsiveContainer width="100%" height={240}>
              <BarChart data={orderChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
        }
      </Card>
    </div>
  );
};

export const VendorDashboardPage = () => (
  <DashboardShell title="Vendor portal" description="Products, categories, orders, customers, payout, reviews and profile settings.">
    <Tabs tabs={[
      { value: "dashboard", label: "Dashboard", content: <VendorAnalytics /> },
      { value: "products", label: "Products", content: <PlaceholderPanel title="Products" icon={<Package />} body="Product listing, create, edit, stock management." /> },
      { value: "orders", label: "Orders", content: <PlaceholderPanel title="Orders" icon={<ClipboardList />} body="Incoming vendor orders and fulfilment." /> },
      { value: "payout", label: "Payout", content: <PlaceholderPanel title="Payout" icon={<DollarSign />} body="Payout history, bank details and reconciliation." /> },
      { value: "settings", label: "Settings", content: <SettingsPanel /> },
    ]} />
  </DashboardShell>
);

// ─── Delivery dashboard ───────────────────────────────────────────────────────

const DeliveryOrderList = ({ status, label }: { status?: string; label: string }) => {
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["delivery", status ?? "all"],
    queryFn: () => status === "Delivered" ? deliveryService.getCompletedDeliveries() : deliveryService.getMyDeliveries(status),
  });

  const handleStatusUpdate = async (orderId: string, newStatus: "Out For Delivery" | "Delivered") => {
    try {
      await deliveryService.updateDeliveryStatus(orderId, newStatus);
      toast.success(`Marked as ${newStatus}`);
      await refetch();
    } catch {
      // toast shown by interceptor
    }
  };

  if (isLoading) return <LoadingState />;
  if (orders.length === 0) return <EmptyState title={`No ${label.toLowerCase()}`} body="Orders will appear here when assigned." />;

  return (
    <div className="grid gap-4">
      {orders.map((order) => <DeliveryOrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} />)}
    </div>
  );
};

const DeliveryOrderCard = ({ order, onStatusUpdate }: { order: DeliveryOrder; onStatusUpdate: (id: string, status: "Out For Delivery" | "Delivered") => void }) => (
  <Card className="p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <Badge>{order.status}</Badge>
        <h3 className="mt-2 font-bold text-sm">{order.orderId}</h3>
        <p className="text-xs muted-copy mt-1">{order.customerName} · {order.customerPhone}</p>
        <p className="text-xs muted-copy">{order.address}</p>
      </div>
      <p className="font-black">{currency(order.total)}</p>
    </div>
    {order.status !== "Delivered" && (
      <div className="mt-4 flex flex-wrap gap-2">
        {order.status !== "Out For Delivery" && (
          <Button size="sm" variant="outline" onClick={() => onStatusUpdate(order.id, "Out For Delivery")}>Mark out for delivery</Button>
        )}
        <Button size="sm" onClick={() => onStatusUpdate(order.id, "Delivered")}>Mark delivered</Button>
      </div>
    )}
  </Card>
);

export const DeliveryDashboardPage = () => {
  const online = useOperationsStore((s) => s.deliveryOnline);
  const setOnline = useOperationsStore((s) => s.setDeliveryOnline);
  const earnings = useOperationsStore((s) => s.deliveryEarnings);
  const syncRevenue = useOperationsStore((s) => s.syncRevenue);
  const { data: dashData } = useQuery({ queryKey: ["dashboard", "delivery"], queryFn: dashboardService.getDeliveryDashboard });

  useEffect(() => { void syncRevenue(); }, [syncRevenue]);

  return (
    <DashboardShell title="Delivery dashboard" description="Assigned orders, live status updates, earnings and availability toggle.">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Tabs tabs={[
          { value: "assigned", label: "Assigned", content: <DeliveryOrderList label="Assigned" /> },
          { value: "active", label: "Active", content: <DeliveryOrderList status="Out For Delivery" label="Active" /> },
          { value: "completed", label: "Completed", content: <DeliveryOrderList status="Delivered" label="Completed" /> },
        ]} />
        <Card className="h-fit p-6">
          <Badge>{online ? "Available" : "Offline"}</Badge>
          <h2 className="mt-4 text-2xl font-black">{currency(earnings)} earnings</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-primary-50 p-3 dark:bg-primary-500/15">
              <p className="text-xl font-black text-primary-700 dark:text-primary-300">{dashData?.assigned ?? 0}</p>
              <p className="text-xs muted-copy">Assigned</p>
            </div>
            <div className="rounded-2xl bg-primary-50 p-3 dark:bg-primary-500/15">
              <p className="text-xl font-black text-primary-700 dark:text-primary-300">{dashData?.completed ?? 0}</p>
              <p className="text-xs muted-copy">Completed</p>
            </div>
          </div>
          <Button className="mt-5 w-full" variant={online ? "danger" : "primary"} onClick={() => setOnline(!online)}>
            {online ? "Go offline" : "Go online"}
          </Button>
        </Card>
      </div>
    </DashboardShell>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PlaceholderPanel = ({ title, icon, body }: { title: string; icon: ReactNode; body: string }) => (
  <Card className="p-6">
    <div className="mb-3 flex items-center gap-3 text-primary-700">{icon}<h2 className="text-2xl font-black text-ink-950 dark:text-white">{title}</h2></div>
    <p className="muted-copy">{body}</p>
  </Card>
);

const SettingsPanel = () => (
  <Card className="p-6">
    <Settings className="h-8 w-8 text-primary-600" />
    <h2 className="mt-4 text-2xl font-black">Settings and profile</h2>
    <p className="mt-2 muted-copy">Profile, permissions, payout preferences, notification settings and security controls.</p>
  </Card>
);
