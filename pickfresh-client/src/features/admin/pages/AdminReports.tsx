import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { adminService } from "../../../services/adminService";
import { PageHeader, SectionCard, CardSkeleton } from "../../../components/DashboardUI";
import { currency } from "../../../lib/utils";

export const AdminReports = () => {
  const { data: sales = [], isLoading: salesLoading } = useQuery({ queryKey: ["admin", "reports", "sales"], queryFn: () => adminService.getSalesReport({ period: "monthly" }) });
  const { data: inventory, isLoading: invLoading } = useQuery({ queryKey: ["admin", "reports", "inventory"], queryFn: adminService.getInventoryReport });

  const salesChart = sales.map((s: any) => ({
    name: `${s._id?.month ?? ""}-${String(s._id?.year ?? "").slice(-2)}`,
    revenue: s.revenue,
    orders: s.orders,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" subtitle="Sales trends, revenue breakdowns, and inventory health metrics." />

      {salesLoading ? <CardSkeleton count={1} /> : (
        <SectionCard title="Monthly Sales Trend">
          {salesChart.length === 0 ? (
            <p className="text-sm muted-copy">No sales data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(value: any) => currency(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      )}

      {salesLoading ? <CardSkeleton count={1} /> : (
        <SectionCard title="Monthly Order Volume">
          {salesChart.length === 0 ? (
            <p className="text-sm muted-copy">No order data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={salesChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      )}

      {!invLoading && inventory && (
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Total Products", value: inventory.total },
            { label: "In Stock", value: inventory.inStock },
            { label: "Low Stock", value: inventory.lowStock },
            { label: "Out of Stock", value: inventory.outOfStock },
          ].map((stat) => (
            <div key={stat.label} className="surface-card rounded-2xl p-5 text-center">
              <p className="text-3xl font-black text-ink-950 dark:text-white">{stat.value ?? 0}</p>
              <p className="mt-1 text-sm muted-copy">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
