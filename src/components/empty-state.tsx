import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-low px-lg py-3xl text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-md flex size-12 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
          <Icon className="size-6" />
        </div>
      ) : null}
      <h3 className="text-headline-sm text-on-surface">{title}</h3>
      {description ? (
        <p className="mt-sm max-w-sm text-body-md text-on-surface-variant">{description}</p>
      ) : null}
      {action ? <div className="mt-lg">{action}</div> : null}
    </div>
  );
}
