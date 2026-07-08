import { useQuery } from "@tanstack/react-query";
import { DollarSign, PackageCheck, TrendingUp } from "lucide-react";
import { PageHeader, SectionCard, StatCard } from "../../../components/DashboardUI";
import { Card } from "../../../components/ui";
import { currency } from "../../../lib/utils";
import { vendorService } from "../../../services/vendorService";

export const VendorEarnings = () => {
  const { data } = useQuery({ queryKey: ["vendor", "earnings"], queryFn: vendorService.getMyEarnings });

  return (
    <div className="space-y-6">
      <PageHeader title="Earnings" subtitle="Track payouts, order earnings, and seller revenue." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={DollarSign} label="Total earnings" value={currency(data?.total ?? 0)} iconBg="bg-citrus-50" iconColor="text-citrus-600" />
        <StatCard icon={TrendingUp} label="This month" value={currency(data?.month ?? 0)} iconBg="bg-green-50" iconColor="text-green-600" />
        <StatCard icon={PackageCheck} label="Paid orders" value={String(data?.orders ?? 0)} iconBg="bg-blue-50" iconColor="text-blue-600" />
      </div>
      <SectionCard title="Payout summary">
        <Card className="p-5 text-sm muted-copy">
          Payout history and settlement details will appear here as orders are completed.
        </Card>
      </SectionCard>
    </div>
  );
};
