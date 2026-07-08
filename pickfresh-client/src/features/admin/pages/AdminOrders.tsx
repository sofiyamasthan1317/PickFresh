import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { Truck } from "lucide-react";
import { orderService } from "../../../services/orderService";
import { adminService } from "../../../services/adminService";
import { DataTable, PageHeader, RowSkeleton, StatusBadge } from "../../../components/DashboardUI";
import { Button, Dialog, Select, ErrorState } from "../../../components/ui";
import { currency } from "../../../lib/utils";

export const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["admin", "orders", statusFilter],
    queryFn: orderService.getOrders,
  });

  const { data: partners = [] } = useQuery({
    queryKey: ["admin", "delivery-partners"],
    queryFn: () => adminService.getDeliveryPartners({ isAvailable: true }),
  });

  const assignMutation = useMutation({
    mutationFn: () => adminService.assignDelivery(assigningOrderId!, selectedPartnerId),
    onSuccess: () => {
      toast.success("Order assigned to delivery partner");
      setAssigningOrderId(null);
      setSelectedPartnerId("");
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  const columns = [
    { key: "id", label: "Order ID", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (o: any) => <StatusBadge status={o.status} />,
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (o: any) => <span className="font-bold">{currency(o.total)}</span>,
    },
    { key: "placedAt", label: "Placed", sortable: true },
  ];

  if (isLoading) return <RowSkeleton rows={10} />;
  if (error) return <ErrorState title="Failed to load orders" body="Please refresh the page and try again." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Management"
        subtitle="Monitor all customer orders, assign delivery partners, and update statuses."
      />
      <div className="flex items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
          options={["all", "Pending", "Confirmed", "Packed", "Shipped", "Out For Delivery", "Delivered", "Cancelled"]}
          placeholder="Filter by status"
        />
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by order ID..."
        rowActions={(o: any) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAssigningOrderId(o.id)}
            disabled={o.status === "Delivered" || o.status === "Cancelled"}
          >
            <Truck className="h-3.5 w-3.5 mr-1" /> Assign
          </Button>
        )}
      />

      {/* Assign delivery dialog */}
      <Dialog
        title="Assign Delivery Partner"
        trigger={<span />}
      >
        {assigningOrderId && (
          <div className="space-y-4">
            <Select
              value={selectedPartnerId}
              onValueChange={setSelectedPartnerId}
              options={partners.map((p) => p.id)}
              placeholder="Select available partner"
            />
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => assignMutation.mutate()}
              disabled={!selectedPartnerId}
            >
              Confirm Assignment
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
};
