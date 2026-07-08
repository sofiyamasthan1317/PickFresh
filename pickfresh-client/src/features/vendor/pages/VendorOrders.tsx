import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { vendorService } from "../../../services/vendorService";
import { DataTable, PageHeader, RowSkeleton, StatusBadge } from "../../../components/DashboardUI";
import { Button, Select, ErrorState } from "../../../components/ui";
import { currency } from "../../../lib/utils";

const VENDOR_TRANSITIONS: Record<string, string[]> = {
  Pending:   ["Confirmed"],
  Confirmed: ["Packed"],
  Packed:    ["Shipped"],
};

export const VendorOrders = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["vendor", "orders", statusFilter],
    queryFn: () => vendorService.getMyOrders(statusFilter !== "all" ? { status: statusFilter } : {}),
  });

  const orders = data?.orders ?? [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => vendorService.updateOrderStatus(id, status),
    onSuccess: () => { toast.success("Status updated"); void queryClient.invalidateQueries({ queryKey: ["vendor", "orders"] }); },
  });

  const columns = [
    { key: "orderId", label: "Order ID", sortable: true },
    { key: "orderStatus", label: "Status", render: (o: any) => <StatusBadge status={o.orderStatus} /> },
    { key: "totalAmount", label: "Total", render: (o: any) => <span className="font-bold whitespace-nowrap">{currency(o.totalAmount ?? 0)}</span> },
    { key: "createdAt", label: "Date", render: (o: any) => <span className="whitespace-nowrap">{o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—"}</span> },
  ];

  if (isLoading) return <RowSkeleton rows={8} />;
  if (error) return <ErrorState title="Failed to load orders" body="Please refresh and try again." />;

  return (
    <div className="space-y-6">
      <PageHeader title="My Orders" subtitle="Manage incoming orders and update fulfilment status." />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
          options={["all", "Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"]}
          placeholder="Filter by status"
          className="w-full sm:w-56"
        />
      </div>

      <div className="-mx-4 sm:mx-0 overflow-x-auto rounded-lg border border-gray-200">
        <div className="min-w-[720px] sm:min-w-0">
          <DataTable
            columns={columns}
            data={orders.map((o: any) => ({ ...o, id: o._id }))}
            searchPlaceholder="Search orders..."
            rowActions={(o: any) => {
              const next = VENDOR_TRANSITIONS[o.orderStatus];
              if (!next) return null;
              return (
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {next.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant="outline"
                      className="whitespace-nowrap"
                      onClick={() => statusMutation.mutate({ id: o.id, status })}
                    >
                      Mark {status}
                    </Button>
                  ))}
                </div>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};