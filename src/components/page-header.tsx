import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <header
  className={cn(
    "block w-full min-w-0 max-w-none",
    className,
  )}
>
      <div className="block w-full min-w-0 max-w-none space-y-sm">
        {breadcrumbs ? (
          <div className="text-label-md text-on-surface-variant">{breadcrumbs}</div>
        ) : null}
        <h1 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">{title}</h1>
        {description ? (
          <p className="block w-full max-w-none whitespace-normal break-words text-body-md text-on-surface-variant leading-relaxed">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-sm">{actions}</div>
      ) : null}
    </header>
  );
}
