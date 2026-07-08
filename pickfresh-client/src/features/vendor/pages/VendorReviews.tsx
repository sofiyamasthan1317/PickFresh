import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { MessageCircle } from "lucide-react";
import { vendorService } from "../../../services/vendorService";
import { PageHeader } from "../../../components/DashboardUI";
import { Button, Card, EmptyState, LoadingState, Textarea, ErrorState } from "../../../components/ui";

export const VendorReviews = () => {
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({ queryKey: ["vendor", "reviews"], queryFn: vendorService.getMyReviews });
  const reviews = data?.data ?? [];

  const replyMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => vendorService.replyToReview(id, text),
    onSuccess: (_, vars) => {
      toast.success("Reply posted");
      setReplyText((p) => { const n = { ...p }; delete n[vars.id]; return n; });
      setOpen(null);
      void queryClient.invalidateQueries({ queryKey: ["vendor", "reviews"] });
    },
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState title="Failed to load reviews" body="Please refresh and try again." />;
  if (reviews.length === 0) return (
    <div className="space-y-6">
      <PageHeader title="Customer Reviews" subtitle="Respond to customer feedback to build trust." />
      <EmptyState title="No reviews yet" body="Reviews will appear here once customers start rating your products." />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Reviews" subtitle="Engage with your customers by replying to their feedback." />
      <div className="grid gap-4">
        {reviews.map((r: any) => (
          <Card key={r._id} className="p-5 border border-ink-200/60 dark:border-white/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-bold text-sm">{r.user?.name ?? "Customer"}</p>
                <p className="text-xs muted-copy mt-0.5">{r.product?.name}</p>
                <p className="mt-2 text-sm italic">"{r.comment}"</p>
                <p className="mt-1 text-xs muted-copy">Rating: {'⭐'.repeat(r.rating)} ({r.rating}/5)</p>
                {r.vendorReply && (
                  <div className="mt-3 rounded-xl bg-citrus-50 dark:bg-citrus-500/10 p-3">
                    <p className="text-xs font-semibold text-citrus-700 dark:text-citrus-400 mb-1">Your reply:</p>
                    <p className="text-sm">{r.vendorReply.text}</p>
                  </div>
                )}
              </div>
              {!r.vendorReply && (
                <Button size="sm" variant="outline" onClick={() => setOpen(open === r._id ? null : r._id)}>
                  <MessageCircle className="h-3.5 w-3.5 mr-1" /> Reply
                </Button>
              )}
            </div>
            {open === r._id && (
              <div className="mt-4 space-y-2">
                <Textarea
                  placeholder="Write a professional reply to this review..."
                  value={replyText[r._id] ?? ""}
                  onChange={(e) => setReplyText((p) => ({ ...p, [r._id]: e.target.value }))}
                />
                <Button className="bg-citrus-500 hover:bg-citrus-600 text-white" size="sm"
                  onClick={() => replyMutation.mutate({ id: r._id, text: replyText[r._id] ?? "" })}
                  disabled={!replyText[r._id]?.trim()}>
                  Post Reply
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
