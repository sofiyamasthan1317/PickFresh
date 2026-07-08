import { useQuery } from "@tanstack/react-query";
import { deliveryService } from "../../../services/deliveryService";
import { DataTable, PageHeader, RowSkeleton, StatusBadge } from "../../../components/DashboardUI";
import { ErrorState } from "../../../components/ui";
import { currency } from "../../../lib/utils";

export const DeliveryHistory = () => {
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["delivery", "history"],
    queryFn: deliveryService.getCompletedDeliveries,
  });

  const columns = [
    { key: "orderId", label: "Order ID", sortable: true },
    { key: "customerName", label: "Customer" },
    { key: "address", label: "Address" },
    { key: "status", label: "Status", render: (o: any) => <StatusBadge status={o.status} /> },
    { key: "total", label: "Value", render: (o: any) => <span className="font-bold">{currency(o.total)}</span> },
    { key: "updatedAt", label: "Delivered On", sortable: true },
  ];

  if (isLoading) return <RowSkeleton rows={8} />;
  if (error) return <ErrorState title="Failed to load history" body="Please refresh and try again." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Delivery History" subtitle="A complete log of all your past completed deliveries." />
      <DataTable columns={columns} data={orders} searchPlaceholder="Search by order ID or customer..." />
    </div>
  );
};
