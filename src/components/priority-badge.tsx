import { cva, type VariantProps } from "class-variance-authority";

import type { ComplaintPriority } from "@/types/ui";
import { cn } from "@/lib/utils";

const priorityBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider",
  {
    variants: {
      priority: {
        low: "border border-[#A3A3A3] text-[#A3A3A3] bg-transparent",
        medium: "border border-[#525252] text-[#525252] bg-transparent",
        high: "border border-[#D97706] text-[#D97706] bg-transparent",
        urgent: "border border-[#CC0000] text-[#CC0000] bg-transparent",
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

