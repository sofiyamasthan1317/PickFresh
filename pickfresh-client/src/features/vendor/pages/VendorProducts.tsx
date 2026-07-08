import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Trash2, Edit, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { vendorService } from "../../../services/vendorService";
import { DataTable, PageHeader, RowSkeleton, StatusBadge } from "../../../components/DashboardUI";
import { Button, ConfirmDialog, ErrorState } from "../../../components/ui";
import { currency } from "../../../lib/utils";

export const VendorProducts = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["vendor", "products"], queryFn: () => vendorService.getMyProducts() });
  const products = data?.products ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vendorService.deleteProduct(id),
    onSuccess: () => { toast.success("Product deleted"); void queryClient.invalidateQueries({ queryKey: ["vendor", "products"] }); },
  });

  const columns = [
    {
      key: "image", label: "Image",
      render: (p: any) => p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded-xl object-cover" /> : <div className="h-10 w-10 rounded-xl bg-ink-200 dark:bg-ink-800" />,
    },
    { key: "name", label: "Product", sortable: true },
    { key: "price", label: "Price", render: (p: any) => currency(p.price) },
    { key: "stock", label: "Stock", render: (p: any) => <StatusBadge status={p.stock === 0 ? "Out of Stock" : p.stock <= 10 ? "Low Stock" : "Active"} /> },
    { key: "isAvailable", label: "Listed", render: (p: any) => <StatusBadge status={p.isAvailable ? "Active" : "Offline"} /> },
  ];

  if (isLoading) return <RowSkeleton rows={8} />;
  if (error) return <ErrorState title="Failed to load products" body="Please refresh and try again." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Products"
        subtitle="Manage your listed products, update pricing, and check stock levels."
        action={
          <Button asChild className="bg-[#2C9855] hover:bg-[#247a44] text-white">
            <Link to="/vendor/add-product"><Plus className="h-4 w-4 mr-1.5" /> Add Product</Link>
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Search your products..."
        rowActions={(p: any) => (
          <div className="flex justify-end gap-1.5">
            <Button asChild variant="ghost" size="icon">
              <Link to={`/vendor/add-product?edit=${p.id}`}><Edit className="h-4 w-4" /></Link>
            </Button>
            <ConfirmDialog title={`Delete ${p.name}?`} onConfirm={() => deleteMutation.mutate(p.id)}
              trigger={<Button variant="ghost" size="icon" className="hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>}
            />
          </div>
        )}
      />
    </div>
  );
};
