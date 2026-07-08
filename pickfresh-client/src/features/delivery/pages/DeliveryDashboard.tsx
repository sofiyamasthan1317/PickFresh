import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bike, CheckCircle, DollarSign, ToggleLeft, ToggleRight, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { dashboardService } from "../../../services/dashboardService";
import { deliveryService } from "../../../services/deliveryService";
import { CardSkeleton, PageHeader, StatCard, SectionCard, StatusBadge } from "../../../components/DashboardUI";
import { Button, Card } from "../../../components/ui";
import { currency } from "../../../lib/utils";
import { useAuthStore } from "../../../store/authStore";

export const DeliveryDashboard = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({ queryKey: ["delivery", "dashboard"], queryFn: dashboardService.getDeliveryDashboard });
  const { data: earningsData } = useQuery({ queryKey: ["delivery", "earnings"], queryFn: deliveryService.getEarnings });
  const { data: assigned = [] } = useQuery({ queryKey: ["delivery", "orders", "assigned"], queryFn: () => deliveryService.getMyDeliveries() });

  const toggleMutation = useMutation({
    mutationFn: deliveryService.toggleAvailability,
    onSuccess: (isAvailable) => {
      toast.success(isAvailable ? "You are now available" : "You are now offline");
      void queryClient.invalidateQueries({ queryKey: ["delivery"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Out For Delivery" | "Delivered" }) =>
      deliveryService.updateDeliveryStatus(id, status),
    onSuccess: () => { toast.success("Status updated"); void queryClient.invalidateQueries({ queryKey: ["delivery"] }); },
  });

  if (isLoading) return <div className="space-y-6"><PageHeader title="Delivery Dashboard" subtitle="Loading your stats..." /><CardSkeleton count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery Dashboard"
        subtitle={`Welcome back, ${user?.name ?? "Partner"}. Here's your performance summary.`}
      />

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Bike} label="Assigned" value={String(data?.assigned ?? 0)} iconBg="bg-primary-50 dark:bg-primary-500/15" iconColor="text-primary-600 dark:text-primary-100" index={0} />
        <StatCard icon={CheckCircle} label="Completed" value={String(data?.completed ?? 0)} iconBg="bg-green-50 dark:bg-green-500/15" iconColor="text-green-600" index={1} />
        <StatCard icon={Clock} label="In Progress" value={String(data?.inProgress ?? 0)} iconBg="bg-amber-50 dark:bg-amber-500/15" iconColor="text-amber-600" index={2} />
        <StatCard icon={DollarSign} label="Total Earnings" value={currency(earningsData?.total ?? 0)} iconBg="bg-primary-50 dark:bg-primary-500/15" iconColor="text-primary-600 dark:text-primary-100" index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Active orders list */}
        <SectionCard title="Active Deliveries">
          {assigned.length === 0 ? (
            <p className="text-sm muted-copy text-center py-8">No active deliveries assigned. Stay online to receive orders!</p>
          ) : (
            <div className="space-y-3">
              {assigned.slice(0, 5).map((order) => (
                <div key={order.id} className="rounded-lg border border-ink-200/60 p-4 dark:border-white/10">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <StatusBadge status={order.status} />
                      <p className="mt-1.5 font-bold text-sm">{order.orderId}</p>
                      <p className="text-xs muted-copy">{order.customerName} &middot; {order.address}</p>
                    </div>
                    <p className="font-black text-sm">{currency(order.total)}</p>
                  </div>
                  {order.status !== "Delivered" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {order.status !== "Out For Delivery" && (
                        <Button size="sm" variant="outline" onClick={() => statusMutation.mutate({ id: order.id, status: "Out For Delivery" })}>
                          Start Delivery
                        </Button>
                      )}
                      <Button size="sm" onClick={() => statusMutation.mutate({ id: order.id, status: "Delivered" })}>
                        Mark Delivered
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Availability & Earnings sidebar */}
        <div className="space-y-4">
          <Card className="p-6 border border-ink-200/60 dark:border-white/10 text-center">
            <div
              className={`mx-auto mb-3 h-4 w-4 rounded-full ${data?.isAvailable ? "bg-primary-600" : "bg-red-500"}`}
              aria-label={data?.isAvailable ? "Online" : "Offline"}
            />
            <p className="font-bold text-lg">{data?.isAvailable ? "You're Online" : "You're Offline"}</p>
            <p className="text-sm muted-copy mt-1">{data?.isAvailable ? "Receiving new deliveries" : "Not receiving orders"}</p>
            <Button
              className={`mt-4 w-full ${data?.isAvailable ? "bg-red-500 hover:bg-red-600" : ""} text-white`}
              onClick={() => toggleMutation.mutate()}
              disabled={toggleMutation.isPending}
            >
              {data?.isAvailable ? (<><ToggleRight className="h-4 w-4 mr-1.5" /> Go Offline</>) : (<><ToggleLeft className="h-4 w-4 mr-1.5" /> Go Online</>)}
            </Button>
          </Card>

          <Card className="p-5 border border-ink-200/60 dark:border-white/10">
            <p className="text-xs font-semibold muted-copy uppercase tracking-wide mb-3">Today's Earnings</p>
            <p className="text-3xl font-black text-primary-700 dark:text-primary-100">{currency(earningsData?.todayEarnings ?? 0)}</p>
            <p className="text-xs muted-copy mt-1">{earningsData?.todayDeliveries ?? 0} deliveries today</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
