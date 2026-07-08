import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { vendorService } from "../../../services/vendorService";
import { catalogService } from "../../../services/catalogService";
import { PageHeader } from "../../../components/DashboardUI";
import { Button, Card, Input, Textarea, Select } from "../../../components/ui";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().min(1),
  offerPrice: z.number().optional(),
  stock: z.number().min(0),
  unit: z.string().min(1),
  brand: z.string().optional(),
  category: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export const VendorAddProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: catalogService.getCategories });

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const form = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined) form.append(k, String(v)); });
      return vendorService.createProduct(form);
    },
    onSuccess: () => {
      toast.success("Product created successfully!");
      void queryClient.invalidateQueries({ queryKey: ["vendor", "products"] });
      navigate("/vendor/products");
    },
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="space-y-6 max-w-full">
      <PageHeader title="Add New Product" subtitle="Fill in the product details below to list it on the marketplace." />
      <Card className="p-6 border border-ink-200/60 dark:border-white/10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold muted-copy block mb-1">Product Name *</label>
              <Input {...register("name")} placeholder="e.g. Organic Alphonso Mangoes" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold muted-copy block mb-1">Brand</label>
              <Input {...register("brand")} placeholder="e.g. Farm Direct" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold muted-copy block mb-1">Category *</label>
            <Select
              value={watch("category") ?? ""}
              onValueChange={(v) => setValue("category", v)}
              options={categories.map((c) => c.id)}
              placeholder="Select a category"
            />
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold muted-copy block mb-1">Description *</label>
            <Textarea {...register("description")} placeholder="Describe your product in detail..." />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold muted-copy block mb-1">Price (₹) *</label>
              <Input type="number" {...register("price", { valueAsNumber: true })} />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold muted-copy block mb-1">Offer Price (₹)</label>
              <Input type="number" {...register("offerPrice", { valueAsNumber: true })} />
            </div>
            <div>
              <label className="text-xs font-semibold muted-copy block mb-1">Stock *</label>
              <Input type="number" {...register("stock", { valueAsNumber: true })} />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold muted-copy block mb-1">Unit *</label>
            <Select
              value={watch("unit") ?? ""}
              onValueChange={(v) => setValue("unit", v)}
              options={["kg", "gram", "litre", "ml", "piece", "dozen", "pack", "box"]}
              placeholder="Select unit"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-[#2C9855] hover:bg-[#247a44] text-white" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Create Product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/vendor/products")}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
