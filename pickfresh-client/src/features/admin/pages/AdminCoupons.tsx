import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../../../services/api";
import { DataTable, PageHeader, RowSkeleton, StatusBadge } from "../../../components/DashboardUI";
import { Button, Card, ConfirmDialog, Input, Select, ErrorState } from "../../../components/ui";

const couponService = {
  async getAll() { const r = await api.get("/coupons"); return r.data.data || []; },
  async create(data: any) { await api.post("/coupons", data); },
  async delete(id: string) { await api.delete(`/coupons/${id}`); },
};

const defaultForm = { code: "", discountType: "percentage", discountValue: 0, minimumAmount: 0, usageLimit: null, expiryDate: "", isActive: true };

export const AdminCoupons = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(defaultForm);

  const { data: coupons = [], isLoading, error } = useQuery({ queryKey: ["admin", "coupons"], queryFn: couponService.getAll });

  const createMutation = useMutation({
    mutationFn: () => couponService.create(form),
    onSuccess: () => { toast.success("Coupon created"); setForm(defaultForm); void queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponService.delete(id),
    onSuccess: () => { toast.success("Coupon deleted"); void queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] }); },
  });

  const columns = [
    { key: "code", label: "Code", sortable: true, render: (c: any) => <code className="rounded bg-ink-100 dark:bg-white/10 px-2 py-0.5 text-xs font-mono">{c.code}</code> },
    { key: "discountType", label: "Type" },
    { key: "discountValue", label: "Discount", render: (c: any) => `${c.discountValue}${c.discountType === "percentage" ? "%" : "₹"}` },
    { key: "minimumAmount", label: "Min Order", render: (c: any) => `₹${c.minimumAmount}` },
    { key: "usedCount", label: "Used" },
    { key: "isActive", label: "Status", render: (c: any) => <StatusBadge status={c.isActive ? "Active" : "Expired"} /> },
    { key: "expiryDate", label: "Expires", render: (c: any) => c.expiryDate ? new Date(c.expiryDate).toLocaleDateString("en-IN") : "—" },
  ];

  if (isLoading) return <RowSkeleton rows={6} />;
  if (error) return <ErrorState title="Failed to load coupons" body="Please refresh and try again." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Coupon Manager" subtitle="Create discount coupons, set usage limits and expiry dates." />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <DataTable
          columns={columns}
          data={coupons.map((c: any) => ({ ...c, id: c._id }))}
          searchPlaceholder="Search coupons..."
          rowActions={(c: any) => (
            <ConfirmDialog title={`Delete coupon ${c.code}?`} onConfirm={() => deleteMutation.mutate(c.id)}
              trigger={<Button variant="ghost" size="icon" className="hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>}
            />
          )}
        />
        <Card className="p-5 h-fit space-y-4 border border-ink-200/60 dark:border-white/10">
          <h3 className="font-bold">Create Coupon</h3>
          <Input placeholder="Coupon code (e.g. SAVE20)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })} options={["percentage", "flat"]} placeholder="Discount type" />
          <Input type="number" placeholder="Discount value" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
          <Input type="number" placeholder="Min order amount" value={form.minimumAmount} onChange={(e) => setForm({ ...form, minimumAmount: Number(e.target.value) })} />
          <Input type="date" placeholder="Expiry date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => createMutation.mutate()} disabled={!form.code.trim()}>
            <Plus className="h-4 w-4 mr-1.5" /> Create Coupon
          </Button>
        </Card>
      </div>
    </div>
  );
};
