import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { adminService } from "../../../services/adminService";
import { DataTable, PageHeader, RowSkeleton, StatusBadge } from "../../../components/DashboardUI";
import { Button, ErrorState } from "../../../components/ui";

export const AdminDeliveryPartners = () => {
  const queryClient = useQueryClient();

  const { data: partners = [], isLoading, error } = useQuery({
    queryKey: ["admin", "delivery-partners"],
    queryFn: () => adminService.getDeliveryPartners(),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => adminService.suspendDeliveryPartner(id),
    onSuccess: () => { toast.success("Partner suspended"); void queryClient.invalidateQueries({ queryKey: ["admin", "delivery-partners"] }); },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminService.activateDeliveryPartner(id),
    onSuccess: () => { toast.success("Partner activated"); void queryClient.invalidateQueries({ queryKey: ["admin", "delivery-partners"] }); },
  });

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email" },
    { key: "vehicleType", label: "Vehicle" },
    { key: "vehicleNumber", label: "Plate" },
    {
      key: "isAvailable",
      label: "Availability",
      render: (p: any) => <StatusBadge status={p.isAvailable ? "Online" : "Offline"} />,
    },
    {
      key: "isBlocked",
      label: "Account",
      render: (p: any) => <StatusBadge status={p.isBlocked ? "Blocked" : "Active"} />,
    },
    { key: "createdAt", label: "Joined", sortable: true },
  ];

  if (isLoading) return <RowSkeleton rows={8} />;
  if (error) return <ErrorState title="Failed to load delivery partners" body="Please refresh and try again." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery Partner Management"
        subtitle="Monitor partner availability, performance, and account status."
      />
      <DataTable
        columns={columns}
        data={partners}
        searchPlaceholder="Search by name or vehicle..."
        rowActions={(p: any) => (
          <div className="flex justify-end gap-1.5">
            {p.isBlocked ? (
              <Button size="sm" variant="outline" onClick={() => activateMutation.mutate(p.id)} className="text-green-600">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Activate
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => suspendMutation.mutate(p.id)} className="text-orange-600">
                <ShieldOff className="h-3.5 w-3.5 mr-1" /> Suspend
              </Button>
            )}
          </div>
        )}
      />
    </div>
  );
};
