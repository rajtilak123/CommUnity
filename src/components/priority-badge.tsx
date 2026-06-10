import { cva, type VariantProps } from "class-variance-authority";

import type { ComplaintPriority } from "@/types/ui";
import { cn } from "@/lib/utils";

const priorityBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm font-semibold uppercase tracking-wider",
  {
    variants: {
      priority: {
        low: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
        medium: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
        high: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
        urgent: "bg-error-container text-on-error-container",
      },
    },
    defaultVariants: {
      priority: "medium",
    },
  },
);

const priorityLabels: Record<ComplaintPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export type PriorityBadgeProps = VariantProps<typeof priorityBadgeVariants> & {
  priority: ComplaintPriority;
  className?: string;
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span className={cn(priorityBadgeVariants({ priority }), className)}>
      {priorityLabels[priority]}
    </span>
  );
}
