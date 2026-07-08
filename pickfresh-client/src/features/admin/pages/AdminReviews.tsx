import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { adminService } from "../../../services/adminService";
import { PageHeader, RowSkeleton, StatusBadge } from "../../../components/DashboardUI";
import { Button, Card, ConfirmDialog, EmptyState, ErrorState } from "../../../components/ui";

export const AdminReviews = () => {
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => adminService.getReviews(),
  });

  const hideMutation = useMutation({ mutationFn: (id: string) => adminService.hideReview(id), onSuccess: () => { toast.success("Review hidden"); void queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }); } });
  const showMutation = useMutation({ mutationFn: (id: string) => adminService.showReview(id), onSuccess: () => { toast.success("Review visible"); void queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }); } });
  const deleteMutation = useMutation({ mutationFn: (id: string) => adminService.deleteReview(id), onSuccess: () => { toast.success("Review deleted"); void queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }); } });

  if (isLoading) return <RowSkeleton rows={6} />;
  if (error) return <ErrorState title="Failed to load reviews" body="Please refresh and try again." />;
  if (reviews.length === 0) return (
    <div className="space-y-6">
      <PageHeader title="Review Moderation" subtitle="Hide, show or delete customer reviews." />
      <EmptyState title="No reviews yet" body="Customer reviews will appear here once they start leaving feedback." />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Review Moderation" subtitle="Hide, show or delete customer reviews across all products." />
      <div className="grid gap-4">
        {reviews.map((r: any) => (
          <Card key={r._id} className="p-4 border border-ink-200/60 dark:border-white/10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm">{r.user?.name ?? "Anonymous"}</p>
                  <StatusBadge status={r.isVisible ? "Visible" : "Flagged"} />
                </div>
                <p className="text-sm muted-copy">{r.product?.name ?? "Unknown product"}</p>
                <p className="mt-2 text-sm text-ink-700 dark:text-ink-100">"{r.comment}"</p>
                <p className="mt-1 text-xs muted-copy">Rating: {r.rating}/5</p>
              </div>
              <div className="flex gap-1.5">
                {r.isVisible ? (
                  <Button variant="ghost" size="icon" onClick={() => hideMutation.mutate(r._id)} title="Hide review">
                    <EyeOff className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" onClick={() => showMutation.mutate(r._id)} title="Show review">
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <ConfirmDialog title="Delete this review?" onConfirm={() => deleteMutation.mutate(r._id)}
                  trigger={<Button variant="ghost" size="icon" className="hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
