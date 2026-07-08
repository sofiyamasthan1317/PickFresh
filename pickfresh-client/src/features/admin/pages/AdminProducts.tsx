import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { catalogService } from "../../../services/catalogService";
import { adminService } from "../../../services/adminService";
import { DataTable, PageHeader, RowSkeleton, StatusBadge } from "../../../components/DashboardUI";
import { Button, Card, ConfirmDialog } from "../../../components/ui";
import { currency } from "../../../lib/utils";

export const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => catalogService.getProducts({}),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.bulkDeleteProducts([id]),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  const bulkFlagMutation = useMutation({
    mutationFn: ({ ids, field, value }: { ids: string[]; field: string; value: boolean }) =>
      adminService.bulkUpdateProducts(ids, { [field]: value }),
    onSuccess: () => {
      toast.success("Products updated successfully");
      setSelectedIds([]);
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  const columns = [
    {
      key: "select",
      label: "Select",
      render: (p: any) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(p.id)}
          onChange={(e) => {
            if (e.target.checked) setSelectedIds((prev) => [...prev, p.id]);
            else setSelectedIds((prev) => prev.filter((id) => id !== p.id));
          }}
          className="rounded border-ink-300 text-blue-600 focus:ring-blue-500"
        />
      ),
    },
    { key: "name", label: "Product Name", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "brand", label: "Brand", sortable: true },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (p: any) => (
        <span className="font-semibold text-ink-950 dark:text-white">
          {currency(p.price)}
          {p.offerPrice && <span className="text-xs text-green-600 ml-1.5">{currency(p.offerPrice)}</span>}
        </span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      render: (p: any) => (
        <StatusBadge status={p.stock === 0 ? "Out of Stock" : p.stock <= 10 ? "Low Stock" : "Active"}>
          {p.stock === 0 ? "Out of Stock" : `${p.stock} left`}
        </StatusBadge>
      ),
    },
  ];

  if (isLoading) return <RowSkeleton rows={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products Management"
        subtitle="Manage product listings, details, pricing, and bulk promotional settings."
      />

      {/* Bulk actions panel */}
      {selectedIds.length > 0 && (
        <Card className="p-4 bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
            {selectedIds.length} items selected
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkFlagMutation.mutate({ ids: selectedIds, field: "isFeatured", value: true })}
            >
              Feature
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkFlagMutation.mutate({ ids: selectedIds, field: "isTrending", value: true })}
            >
              Trend
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkFlagMutation.mutate({ ids: selectedIds, field: "isBestSeller", value: true })}
            >
              Best Seller
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (confirm("Are you sure you want to delete selected products?")) {
                  adminService.bulkDeleteProducts(selectedIds).then(() => {
                    toast.success("Products deleted");
                    setSelectedIds([]);
                    void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
                  });
                }
              }}
            >
              Delete Selected
            </Button>
          </div>
        </Card>
      )}

      {/* Product List */}
      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Search products by name or brand..."
        rowActions={(p: any) => (
          <div className="flex justify-end gap-1.5">
            <ConfirmDialog
              title={`Delete product ${p.name}?`}
              onConfirm={() => deleteMutation.mutate(p.id)}
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
