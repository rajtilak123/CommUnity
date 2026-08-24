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
        "w-full min-w-0 flex flex-col items-center justify-center rounded-none border border-dashed border-outline-variant bg-surface px-md py-xl md:px-lg text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-md flex size-10 shrink-0 items-center justify-center border border-outline-variant text-outline">
          <Icon className="size-5" />
        </div>
      ) : null}

      <div className="w-full max-w-md mx-auto space-y-sm text-center">
        <h3 className="w-full font-serif text-headline-sm text-on-surface">
          {title}
        </h3>

        {description ? (
          <p className="w-full text-center text-body-md text-on-surface-variant leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className="mt-lg flex w-full justify-center">
          {action}
        </div>
      ) : null}
    </div>
  );
}