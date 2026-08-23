import { cva, type VariantProps } from "class-variance-authority";

import type { ComplaintStatus } from "@/types/ui";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider",
  {
    variants: {
      status: {
        open: "border border-[#CC0000] text-[#CC0000] bg-transparent",
        in_progress: "border border-[#D97706] text-[#D97706] bg-transparent",
        resolved: "border border-[#111111] text-[#111111] dark:border-[#F0EEE8] dark:text-[#F0EEE8] bg-transparent",
        closed: "border border-[#A3A3A3] text-[#A3A3A3] bg-transparent",
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

