import { useQuery } from "@tanstack/react-query";
import { Boxes, CheckCircle, ClipboardList, DollarSign, Shield, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";
import { dashboardService } from "../../../services/dashboardService";
import { CardSkeleton, StatCard, StatusBadge, PageHeader } from "../../../components/DashboardUI";
import { Card, EmptyState } from "../../../components/ui";
import { currency } from "../../../lib/utils";

export const AdminDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: dashboardService.getAdminDashboard,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Overview" subtitle="Loading stats and analytics..." />
        <CardSkeleton count={4} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load dashboard data"
        body="There was an error communicating with the server. Please try again later."
      />
    );
  }

  const topCategoriesChart = data.topCategories?.map((c) => ({
    name: c.name,
    revenue: c.revenue,
    orders: c.orders,
  })) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control Center"
        subtitle="Manage users, vendors, orders, catalogs, coupons, and check revenue breakdowns."
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={currency(data.revenue || 0)}
          iconBg="bg-primary-50 dark:bg-primary-500/15"
          iconColor="text-primary-600 dark:text-primary-100"
          index={0}
        />
        <StatCard
          icon={ClipboardList}
          label="Total Orders"
          value={String(data.orders?.total || 0)}
          iconBg="bg-primary-50 dark:bg-primary-500/15"
          iconColor="text-primary-600 dark:text-primary-100"
          index={1}
        />
        <StatCard
          icon={Users}
          label="Active Customers"
          value={String(data.users?.total || 0)}
          iconBg="bg-primary-50 dark:bg-primary-500/15"
          iconColor="text-primary-600 dark:text-primary-100"
          index={2}
        />
        <StatCard
          icon={Boxes}
          label="Total Products"
          value={String(data.products || 0)}
          iconBg="bg-primary-50 dark:bg-primary-500/15"
          iconColor="text-primary-600 dark:text-primary-100"
          index={3}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={TrendingUp}
          label="Pending Deliveries"
          value={String(data.orders?.pending || 0)}
          iconBg="bg-amber-50 dark:bg-amber-500/15"
          iconColor="text-amber-600"
          index={4}
        />
        <StatCard
          icon={CheckCircle}
          label="Completed Orders"
          value={String(data.orders?.delivered || 0)}
          iconBg="bg-green-50 dark:bg-green-500/15"
          iconColor="text-green-600"
          index={5}
        />
        <StatCard
          icon={Shield}
          label="Active Vendors"
          value={String(data.users?.vendors || 0)}
          iconBg="bg-citrus-50 dark:bg-citrus-500/15"
          iconColor="text-citrus-600 dark:text-citrus-400"
          index={6}
        />
      </div>

      {/* Analytics Charts */}
      {topCategoriesChart.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5 border border-ink-200/60 dark:border-white/10">
            <h3 className="mb-4 font-bold text-ink-950 dark:text-white">Top Categories by Revenue</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={topCategoriesChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Area dataKey="revenue" stroke="#2c9855" fill="#dbf6e5" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5 border border-ink-200/60 dark:border-white/10">
            <h3 className="mb-4 font-bold text-ink-950 dark:text-white">Top Categories by Volume</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topCategoriesChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#2C9855" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Recent Orders List */}
      <Card className="p-5 border border-ink-200/60 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink-950 dark:text-white">Recent Order Activity</h3>
          <Link to="/admin/orders" className="text-xs font-semibold text-primary-700 hover:underline dark:text-primary-100">
            View All Orders
          </Link>
        </div>
        {(!data.recentOrders || data.recentOrders.length === 0) && (
          <EmptyState title="No orders yet" body="Recent orders will appear here once customers start buying." />
        )}
        <div className="grid gap-3">
          {data.recentOrders?.map((order: any) => (
            <div
              key={order._id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-200/60 p-4 dark:border-white/10 hover:bg-ink-100/35 dark:hover:bg-white/5 transition-colors"
            >
              <div>
                <p className="font-bold text-sm text-ink-950 dark:text-white">{order.orderId}</p>
                <p className="text-xs muted-copy">
                  {order.user?.name ?? "Guest User"} · {order.user?.email ?? ""}
                </p>
              </div>
              <StatusBadge status={order.orderStatus} />
              <span className="font-black text-sm text-ink-950 dark:text-white">
                {currency(order.totalAmount ?? 0)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
