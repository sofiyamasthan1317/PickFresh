import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { catalogService } from "../../../services/catalogService";
import { adminService } from "../../../services/adminService";
import { DataTable, PageHeader, RowSkeleton, StatusBadge } from "../../../components/DashboardUI";
import { Button, Card, ConfirmDialog, Input } from "../../../components/ui";

export const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: catalogService.getCategories,
  });

  const createMutation = useMutation({
    mutationFn: () => adminService.createCategory({ name, description, image, isActive: true }),
    onSuccess: () => {
      toast.success("Category created");
      setName("");
      setDescription("");
      setImage("");
      void queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (cat: any) => (
        cat.image ? (
          <img src={cat.image} alt={cat.name} className="h-10 w-10 rounded-xl object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-xl bg-ink-200 dark:bg-ink-800 flex items-center justify-center font-bold">
            {cat.name[0]}
          </div>
        )
      ),
    },
    { key: "name", label: "Category Name", sortable: true },
    { key: "description", label: "Description" },
    {
      key: "status",
      label: "Status",
      render: () => <StatusBadge status="Active" />,
    },
  ];

  if (isLoading) return <RowSkeleton rows={6} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category Manager"
        subtitle="Manage available marketplace departments, icons, and descriptions."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Categories List */}
        <DataTable
          columns={columns}
          data={categories}
          searchPlaceholder="Search categories..."
          rowActions={(cat: any) => (
            <div className="flex justify-end gap-1.5">
              <ConfirmDialog
                title={`Delete category ${cat.name}?`}
                onConfirm={() => deleteMutation.mutate(cat.id)}
                trigger={
                  <Button variant="ghost" size="icon" className="hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          )}
        />

        {/* Add/Edit form */}
        <Card className="p-5 h-fit space-y-4 border border-ink-200/60 dark:border-white/10">
          <h3 className="font-bold text-ink-950 dark:text-white">Create New Category</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold muted-copy block mb-1">Category Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fresh Fruits" />
            </div>
            <div>
              <label className="text-xs font-semibold muted-copy block mb-1">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief department outline"
              />
            </div>
            <div>
              <label className="text-xs font-semibold muted-copy block mb-1">Image URL</label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Unsplash / CDN link"
              />
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => createMutation.mutate()}
              disabled={!name.trim()}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Save Category
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
