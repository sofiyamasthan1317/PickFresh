import { motion, type Variants } from "framer-motion";
import { type ElementType, type ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { Button, Input } from "./ui";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" },
  }),
};

type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
  icon: ElementType;
  iconBg?: string;
  iconColor?: string;
  trend?: { value: string; up: boolean };
  index?: number;
};

export const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  iconBg = "bg-primary-50 dark:bg-primary-500/15",
  iconColor = "text-primary-600 dark:text-primary-100",
  trend,
  index = 0,
}: StatCardProps) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    custom={index}
    className="surface-card rounded-lg p-4 sm:p-5"
  >
    <div className="flex items-start justify-between gap-3">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11", iconBg)}>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </div>
      {trend && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-bold",
            trend.up
              ? "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400"
              : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
          )}
        >
          {trend.up ? "Up" : "Down"} {trend.value}
        </span>
      )}
    </div>
    <p className="mt-4 break-words text-2xl font-black text-ink-950 dark:text-white">{value}</p>
    <p className="text-sm font-semibold text-ink-500 dark:text-ink-100/60">{label}</p>
    {sub && <p className="mt-1 text-xs muted-copy">{sub}</p>}
  </motion.div>
);

export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between"
  >
    <div className="min-w-0">
      <h1 className="break-words text-2xl font-black text-ink-950 dark:text-white">{title}</h1>
      {subtitle && <p className="mt-1 max-w-3xl text-sm leading-6 muted-copy">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </motion.div>
);

const statusMap: Record<string, string> = {
  Active: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  Approved: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  Delivered: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  Completed: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  Online: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  Visible: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  Pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  Shipped: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  "Out For Delivery": "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  Assigned: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  Confirmed: "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-100",
  Packed: "bg-citrus-50 text-citrus-700 dark:bg-citrus-500/15 dark:text-citrus-400",
  "Low Stock": "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  Cancelled: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  Rejected: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  Blocked: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  Flagged: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  Expired: "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-400",
  "Out of Stock": "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-400",
  Offline: "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-400",
};

export const StatusBadge = ({ status, children }: { status: string; children?: ReactNode }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
      statusMap[status] ?? "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300",
    )}
  >
    {children ?? status}
  </span>
);

type Column<T> = { key: keyof T | string; label: string; render?: (row: T) => ReactNode; sortable?: boolean };

type DataTableProps<T extends { id: string }> = {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  rowActions?: (row: T) => ReactNode;
  pageSize?: number;
};

export function DataTable<T extends { id: string }>({
  columns,
  data,
  searchPlaceholder = "Search...",
  rowActions,
  pageSize = 8,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = data.filter((row) =>
    Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(query.toLowerCase())),
  );

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = String((a as any)[sortKey] ?? "");
        const bv = String((b as any)[sortKey] ?? "");
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      })
    : filtered;

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="surface-card overflow-hidden rounded-lg">
      <div className="flex flex-col gap-3 border-b border-ink-200/60 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="h-9 pl-9 text-sm"
          />
        </div>
        <span className="text-xs muted-copy">{filtered.length} records</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200/60 bg-ink-50/50 dark:border-white/10 dark:bg-white/5">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => handleSort(String(col.key), col.sortable)}
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-ink-500 dark:text-ink-100/50",
                    col.sortable && "cursor-pointer select-none hover:text-ink-950 dark:hover:text-white",
                  )}
                >
                  {col.label} {col.sortable && sortKey === String(col.key) && (sortAsc ? "Asc" : "Desc")}
                </th>
              ))}
              {rowActions && (
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-bold uppercase tracking-normal text-ink-500 dark:text-ink-100/50">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 dark:divide-white/5">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="py-12 text-center">
                  <EmptyIllustration title="No records found" body="Try adjusting your search." />
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="transition-colors hover:bg-ink-50/50 dark:hover:bg-white/5"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="whitespace-nowrap px-4 py-3">
                      {col.render ? col.render(row) : String((row as any)[col.key] ?? "-")}
                    </td>
                  ))}
                  {rowActions && <td className="px-4 py-3 text-right">{rowActions(row)}</td>}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 border-t border-ink-200/60 p-4 dark:border-white/10">
          <span className="text-xs muted-copy">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export const EmptyIllustration = ({ title, body }: { title: string; body?: string }) => (
  <div className="flex flex-col items-center gap-3 py-10 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-ink-100 dark:bg-white/10">
      <svg viewBox="0 0 64 64" className="h-10 w-10 text-ink-300 dark:text-ink-100/30" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="8" y="16" width="48" height="36" rx="4" />
        <path d="M24 16v-4a8 8 0 0 1 16 0v4" />
        <path d="M32 32v4" />
        <circle cx="32" cy="30" r="1" fill="currentColor" />
      </svg>
    </div>
    <p className="font-bold text-ink-950 dark:text-white">{title}</p>
    {body && <p className="max-w-xs text-sm muted-copy">{body}</p>}
  </div>
);

export const RowSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="surface-card overflow-hidden rounded-lg">
    <div className="border-b border-ink-200/60 p-4 dark:border-white/10">
      <div className="h-9 w-64 max-w-full animate-pulse rounded-lg bg-ink-100 dark:bg-white/10" />
    </div>
    <div className="divide-y divide-ink-100 dark:divide-white/5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <div className="h-4 w-1/4 animate-pulse rounded bg-ink-100 dark:bg-white/10" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-ink-100 dark:bg-white/10" />
          <div className="ml-auto h-4 w-1/6 animate-pulse rounded bg-ink-100 dark:bg-white/10" />
        </div>
      ))}
    </div>
  </div>
);

export const CardSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="surface-card rounded-lg p-5">
        <div className="h-11 w-11 animate-pulse rounded-lg bg-ink-100 dark:bg-white/10" />
        <div className="mt-4 h-7 w-24 animate-pulse rounded bg-ink-100 dark:bg-white/10" />
        <div className="mt-2 h-4 w-16 animate-pulse rounded bg-ink-100 dark:bg-white/10" />
      </div>
    ))}
  </div>
);

export const SectionCard = ({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) => (
  <div className="surface-card overflow-hidden rounded-lg">
    <div className="flex flex-col gap-3 border-b border-ink-200/60 px-4 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <h3 className="font-bold text-ink-950 dark:text-white">{title}</h3>
      {action}
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </div>
);
