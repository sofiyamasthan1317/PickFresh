import { useQuery } from "@tanstack/react-query";
import { CalendarDays, DollarSign, PackageCheck, TrendingUp } from "lucide-react";
import { deliveryService } from "../../../services/deliveryService";
import { CardSkeleton, PageHeader, SectionCard, StatCard } from "../../../components/DashboardUI";
import { Card, EmptyState, ErrorState } from "../../../components/ui";
import { currency } from "../../../lib/utils";

export const DeliveryEarnings = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["delivery", "earnings"],
    queryFn: deliveryService.getEarnings,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Delivery Earnings" subtitle="Loading payout summary..." />
        <CardSkeleton count={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Failed to load earnings" body="Please refresh and try again." />;
  }

  const monthly = data?.monthly ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery Earnings"
        subtitle="Review your delivery payouts, today's activity, and monthly earnings."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={DollarSign}
          label="Total Earnings"
          value={currency(data?.total ?? 0)}
          iconBg="bg-primary-50 dark:bg-primary-500/15"
          iconColor="text-primary-600 dark:text-primary-100"
          index={0}
        />
        <StatCard
          icon={CalendarDays}
          label="Today's Earnings"
          value={currency(data?.todayEarnings ?? 0)}
          iconBg="bg-primary-50 dark:bg-primary-500/15"
          iconColor="text-primary-600 dark:text-primary-100"
          index={1}
        />
        <StatCard
          icon={PackageCheck}
          label="Deliveries Today"
          value={String(data?.todayDeliveries ?? 0)}
          iconBg="bg-citrus-50 dark:bg-citrus-500/15"
          iconColor="text-citrus-600 dark:text-citrus-400"
          index={2}
        />
      </div>

      <SectionCard title="Monthly Payouts">
        {monthly.length === 0 ? (
          <EmptyState title="No payout history yet" body="Completed delivery earnings will appear here." />
        ) : (
          <div className="grid gap-3">
            {monthly.map((item: any) => {
              const label = item._id?.month && item._id?.year ? `${item._id.month}/${item._id.year}` : "Month";
              return (
                <Card key={label} className="flex flex-col gap-3 rounded-lg border border-ink-200/60 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-100">
                      <TrendingUp className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-bold text-ink-950 dark:text-white">{label}</p>
                      <p className="text-sm muted-copy">{item.deliveries ?? 0} deliveries completed</p>
                    </div>
                  </div>
                  <p className="text-lg font-black text-primary-700 dark:text-primary-100">{currency(item.revenue ?? 0)}</p>
                </Card>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
};
