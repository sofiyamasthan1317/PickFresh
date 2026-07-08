import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, PauseCircle } from "lucide-react";
import { adminService } from "../../../services/adminService";
import { DataTable, PageHeader, RowSkeleton, StatusBadge } from "../../../components/DashboardUI";
import { Button, Select, ErrorState } from "../../../components/ui";

export const AdminVendors = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: vendors = [], isLoading, error } = useQuery({
    queryKey: ["admin", "vendors", statusFilter],
    queryFn: () => adminService.getVendors(statusFilter !== "all" ? { vendorStatus: statusFilter } : {}),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.approveVendor(id),
    onSuccess: () => { toast.success("Vendor approved"); void queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] }); },
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminService.rejectVendor(id),
    onSuccess: () => { toast.success("Vendor rejected"); void queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] }); },
  });
  const suspendMutation = useMutation({
    mutationFn: (id: string) => adminService.suspendVendor(id),
    onSuccess: () => { toast.success("Vendor suspended"); void queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] }); },
  });

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email" },
    { key: "businessName", label: "Business" },
    {
      key: "vendorStatus",
      label: "Status",
      sortable: true,
      render: (v: any) => <StatusBadge status={v.vendorStatus} />,
    },
    { key: "createdAt", label: "Joined", sortable: true },
  ];

  if (isLoading) return <RowSkeleton rows={8} />;
  if (error) return <ErrorState title="Failed to load vendors" body="Please refresh and try again." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Management"
        subtitle="Review vendor applications, approve, reject, or suspend seller accounts."
      />
      <Select
        value={statusFilter}
        onValueChange={setStatusFilter}
        options={["all", "pending", "approved", "rejected", "suspended"]}
        placeholder="Filter by status"
      />
      <DataTable
        columns={columns}
        data={vendors}
        searchPlaceholder="Search vendors..."
        rowActions={(v: any) => (
          <div className="flex justify-end gap-1.5">
            {v.vendorStatus === "pending" && (
              <>
                <Button size="sm" variant="outline" onClick={() => approveMutation.mutate(v.id)} className="text-green-600">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate(v.id)} className="text-red-600">
                  <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                </Button>
              </>
            )}
            {v.vendorStatus === "approved" && (
              <Button size="sm" variant="outline" onClick={() => suspendMutation.mutate(v.id)} className="text-orange-600">
                <PauseCircle className="h-3.5 w-3.5 mr-1" /> Suspend
              </Button>
            )}
            {v.vendorStatus === "suspended" && (
              <Button size="sm" variant="outline" onClick={() => approveMutation.mutate(v.id)} className="text-green-600">
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Re-activate
              </Button>
            )}
          </div>
        )}
      />
    </div>
  );
};
