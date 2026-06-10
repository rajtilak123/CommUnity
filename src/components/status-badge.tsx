import { cva, type VariantProps } from "class-variance-authority";

import type { ComplaintStatus } from "@/types/ui";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm font-semibold uppercase tracking-wider",
  {
    variants: {
      status: {
        open: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        in_progress: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        resolved: "bg-primary-container/10 text-primary-container",
        closed: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
      },
    },
    defaultVariants: {
      status: "open",
    },
  },
);

const statusLabels: Record<ComplaintStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export type StatusBadgeProps = VariantProps<typeof statusBadgeVariants> & {
  status: ComplaintStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>{statusLabels[status]}</span>
  );
}
