import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { ShieldOff, ShieldCheck, Trash2 } from "lucide-react";
import { adminService } from "../../../services/adminService";
import { DataTable, PageHeader, RowSkeleton, StatusBadge } from "../../../components/DashboardUI";
import { Button, ConfirmDialog, Select, ErrorState } from "../../../components/ui";

export const AdminCustomers = () => {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState("customer");
  const page = 1;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "users", roleFilter, page],
    queryFn: () => adminService.getUsers({ role: roleFilter, page, limit: 20 }),
  });

  const users = data?.users ?? [];

  const blockMutation = useMutation({
    mutationFn: (id: string) => adminService.blockUser(id),
    onSuccess: () => { toast.success("User blocked"); void queryClient.invalidateQueries({ queryKey: ["admin", "users"] }); },
  });

  const unblockMutation = useMutation({
    mutationFn: (id: string) => adminService.unblockUser(id),
    onSuccess: () => { toast.success("User unblocked"); void queryClient.invalidateQueries({ queryKey: ["admin", "users"] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => { toast.success("User deleted"); void queryClient.invalidateQueries({ queryKey: ["admin", "users"] }); },
  });

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "role", label: "Role", sortable: true },
    {
      key: "isBlocked",
      label: "Status",
      render: (u: any) => <StatusBadge status={u.isBlocked ? "Blocked" : "Active"} />,
    },
    { key: "createdAt", label: "Joined", sortable: true },
  ];

  if (isLoading) return <RowSkeleton rows={10} />;
  if (error) return <ErrorState title="Failed to load customers" body="Please refresh and try again." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Management"
        subtitle="View and manage all platform users. Block or delete problem accounts."
      />
      <div className="flex items-center gap-3">
        <Select
          value={roleFilter}
          onValueChange={setRoleFilter}
          options={["customer", "vendor", "delivery", "admin"]}
          placeholder="Filter by role"
        />
      </div>
      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Search by name or email..."
        rowActions={(u: any) => (
          <div className="flex justify-end gap-1.5">
            {u.isBlocked ? (
              <Button size="sm" variant="outline" onClick={() => unblockMutation.mutate(u.id)}>
                <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Unblock
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => blockMutation.mutate(u.id)} className="text-orange-600">
                <ShieldOff className="h-3.5 w-3.5 mr-1" /> Block
              </Button>
            )}
            <ConfirmDialog
              title={`Delete ${u.name}?`}
              onConfirm={() => deleteMutation.mutate(u.id)}
              trigger={
                <Button variant="ghost" size="icon" className="hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        )}
      />
    </div>
  );
};
