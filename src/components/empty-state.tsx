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

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "w-full min-w-0 flex flex-col items-stretch justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-low px-md py-xl md:px-lg text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-md flex size-12 shrink-0 self-center items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
          <Icon className="size-6" />
        </div>
      ) : null}

      <h3 className="w-full text-center text-headline-sm text-on-surface">
        {title}
      </h3>

      {description ? (
        <p className="mt-sm w-full max-w-md self-center text-center text-body-md text-on-surface-variant leading-relaxed">
          {description}
        </p>
      ) : null}

      {action ? (
        <div className="mt-lg flex w-full justify-center">
          {action}
        </div>
      ) : null}
    </div>
  );
}