import { cva, type VariantProps } from "class-variance-authority";

import type { NoticeStatus } from "@/types/notices";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
  {
    variants: {
      status: {
        draft: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
        published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        archived: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
      },
    },
    defaultVariants: {
      status: "draft",
    },
  },
);

const statusLabels: Record<NoticeStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export type NoticeStatusBadgeProps = VariantProps<typeof statusBadgeVariants> & {
  status: NoticeStatus;
  className?: string;
};

export function NoticeStatusBadge({ status, className }: NoticeStatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>
      {statusLabels[status]}
    </span>
  );
}
