import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { deliveryService } from "../../../services/deliveryService";
import { PageHeader, StatusBadge, RowSkeleton } from "../../../components/DashboardUI";
import { Button, Card, Select, EmptyState, ErrorState } from "../../../components/ui";
import { currency } from "../../../lib/utils";

export const DeliveryOrders = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["delivery", "orders", statusFilter],
    queryFn: () => deliveryService.getMyDeliveries(statusFilter || undefined),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Out For Delivery" | "Delivered" }) =>
      deliveryService.updateDeliveryStatus(id, status),
    onSuccess: () => { toast.success("Status updated"); void queryClient.invalidateQueries({ queryKey: ["delivery", "orders"] }); },
  });

  if (isLoading) return <RowSkeleton rows={6} />;
  if (error) return <ErrorState title="Failed to load orders" body="Please refresh and try again." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Assigned Deliveries" subtitle="View all your assigned orders and update delivery status." />
      <Select
        value={statusFilter}
        onValueChange={setStatusFilter}
        options={["", "Shipped", "Out For Delivery"]}
        placeholder="All statuses"
      />
      {orders.length === 0 ? (
        <EmptyState title="No deliveries assigned" body="Stay online to receive new delivery assignments." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {orders.map((order) => (
            <Card key={order.id} className="p-5 border border-ink-200/60 dark:border-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <StatusBadge status={order.status} />
                  <h3 className="mt-2 font-bold">{order.orderId}</h3>
                  <p className="text-sm muted-copy mt-0.5">{order.customerName}</p>
                  <p className="text-sm muted-copy">{order.address}</p>
                </div>
                <p className="font-black text-primary-700 dark:text-primary-100">{currency(order.total)}</p>
              </div>
              {order.status !== "Delivered" && (
                <div className="mt-4 flex flex-wrap gap-2">
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
