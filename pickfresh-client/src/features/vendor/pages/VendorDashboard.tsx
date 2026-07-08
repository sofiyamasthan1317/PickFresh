import { useQuery } from "@tanstack/react-query";
import { DollarSign, Package, Boxes } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { dashboardService } from "../../../services/dashboardService";
import { vendorService } from "../../../services/vendorService";
import { CardSkeleton, PageHeader, SectionCard, StatCard } from "../../../components/DashboardUI";
import { currency } from "../../../lib/utils";

export const VendorDashboard = () => {
  const { data, isLoading } = useQuery({ queryKey: ["vendor", "dashboard"], queryFn: dashboardService.getVendorDashboard });
  const { data: earningsData } = useQuery({ queryKey: ["vendor", "earnings"], queryFn: vendorService.getMyEarnings });

  const orderChart = data?.orders?.map((o: any) => ({ name: o._id, orders: o.count })) ?? [];
  const earningChart = earningsData?.monthly?.map((m: any) => ({ name: `${m._id?.month}-${String(m._id?.year).slice(-2)}`, revenue: m.revenue })) ?? [];

  if (isLoading) return <div className="space-y-6"><PageHeader title="Vendor Portal" subtitle="Loading your stats..." /><CardSkeleton count={3} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Vendor Dashboard" subtitle="Track your products, revenue, orders, and customer reviews." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={DollarSign} label="Total Revenue" value={currency(data?.revenue ?? 0)} iconBg="bg-primary-50 dark:bg-primary-500/15" iconColor="text-primary-600 dark:text-primary-100" index={0} />
        <StatCard icon={Package} label="Total Products" value={String(data?.products?.total ?? 0)} iconBg="bg-primary-50 dark:bg-primary-500/15" iconColor="text-primary-600 dark:text-primary-100" index={1} />
        <StatCard icon={Boxes} label="Out of Stock" value={String(data?.products?.outOfStock ?? 0)} iconBg="bg-red-50 dark:bg-red-500/15" iconColor="text-red-600" index={2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {orderChart.length > 0 && (
          <SectionCard title="Orders by Status">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={orderChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#2c9855" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        )}
        {earningChart.length > 0 && (
          <SectionCard title="Monthly Revenue">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={earningChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(v: any) => currency(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#2c9855" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </SectionCard>
        )}
      </div>
    </div>
  );
};
