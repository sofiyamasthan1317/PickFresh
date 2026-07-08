import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { adminService } from "../../../services/adminService";
import { PageHeader } from "../../../components/DashboardUI";
import { Button, Card, ConfirmDialog, Input, LoadingState, EmptyState, ErrorState } from "../../../components/ui";

export const AdminBanners = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");

  const { data: banners = [], isLoading, error } = useQuery({ queryKey: ["admin", "banners"], queryFn: adminService.getBanners });

  const createMutation = useMutation({
    mutationFn: () => adminService.createBanner({ title, subtitle, image, link, isActive: true }),
    onSuccess: () => {
      toast.success("Banner created");
      setTitle(""); setSubtitle(""); setImage(""); setLink("");
      void queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteBanner(id),
    onSuccess: () => { toast.success("Banner deleted"); void queryClient.invalidateQueries({ queryKey: ["admin", "banners"] }); },
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState title="Failed to load banners" body="Please refresh and try again." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Banner Manager" subtitle="Manage promotional hero banners shown on the customer storefront." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {banners.length === 0 && <EmptyState title="No banners yet" body="Create your first promotional banner using the form." />}
          {banners.map((b: any) => (
            <Card key={b._id} className="overflow-hidden border border-ink-200/60 dark:border-white/10">
              {b.image && <img src={b.image} alt={b.title} className="w-full h-36 object-cover" />}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold">{b.title}</p>
                  <p className="text-sm muted-copy">{b.subtitle}</p>
                </div>
                <ConfirmDialog title={`Delete banner "${b.title}"?`} onConfirm={() => deleteMutation.mutate(b._id)}
                  trigger={<Button variant="ghost" size="icon" className="hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>}
                />
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-5 h-fit space-y-4 border border-ink-200/60 dark:border-white/10">
          <h3 className="font-bold">Create Banner</h3>
          <Input placeholder="Banner title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Subtitle / CTA text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          <Input placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />
          <Input placeholder="Link URL (optional)" value={link} onChange={(e) => setLink(e.target.value)} />
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => createMutation.mutate()} disabled={!title.trim()}>
            <Plus className="h-4 w-4 mr-1.5" /> Publish Banner
          </Button>
        </Card>
      </div>
    </div>
  );
};
