import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import { vendorService } from "../../../services/vendorService";
import { PageHeader, RowSkeleton, StatusBadge } from "../../../components/DashboardUI";
import { Button, Card, Input, ErrorState } from "../../../components/ui";

export const VendorInventory = () => {
  const queryClient = useQueryClient();
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});

  const { data, isLoading, error } = useQuery({ queryKey: ["vendor", "products"], queryFn: () => vendorService.getMyProducts() });
  const products = data?.products ?? [];

  const bulkMutation = useMutation({
    mutationFn: () => vendorService.bulkUpdateStock(Object.entries(stockEdits).map(([id, stock]) => ({ id, stock }))),
    onSuccess: () => { toast.success("Stock updated successfully"); setStockEdits({}); void queryClient.invalidateQueries({ queryKey: ["vendor", "products"] }); },
  });

  if (isLoading) return <RowSkeleton rows={8} />;
  if (error) return <ErrorState title="Failed to load inventory" body="Please refresh and try again." />;

  const hasEdits = Object.keys(stockEdits).length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Management"
        subtitle="Monitor stock levels and bulk-update quantities for your products."
        action={hasEdits ? (
          <Button className="bg-citrus-500 hover:bg-citrus-600 text-white" onClick={() => bulkMutation.mutate()} disabled={bulkMutation.isPending}>
            <Save className="h-4 w-4 mr-1.5" /> Save All Changes
          </Button>
        ) : undefined}
      />
      <Card className="overflow-hidden border border-ink-200/60 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200/60 dark:border-white/10 bg-ink-50/50 dark:bg-white/5">
                {["Product", "Current Stock", "Unit", "Status", "Update Stock"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-ink-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-white/5">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-ink-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-semibold">{p.name}</td>
                  <td className="px-4 py-3">{stockEdits[p.id] !== undefined ? stockEdits[p.id] : p.stock}</td>
                  <td className="px-4 py-3 text-sm muted-copy">{p.unit || "piece"}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.stock === 0 ? "Out of Stock" : p.stock <= 10 ? "Low Stock" : "Active"} /></td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      className="h-8 w-24 text-sm"
                      defaultValue={p.stock}
                      onChange={(e) => setStockEdits((prev) => ({ ...prev, [p.id]: Number(e.target.value) }))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
