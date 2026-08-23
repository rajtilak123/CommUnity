import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, eyebrow, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "block w-full min-w-0 max-w-none",
        className,
      )}
    >
      <div className="block w-full min-w-0 max-w-none">
        {breadcrumbs ? (
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{breadcrumbs}</div>
        ) : null}
        {eyebrow ? (
          <p className="font-mono text-[10px] tracking-widest text-on-surface-variant uppercase mb-1">{eyebrow}</p>
        ) : null}
        <hr className="border-t-2 border-primary mb-3" />
        <div className="flex items-start justify-between gap-sm">
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-headline-lg-mobile text-on-surface md:text-headline-lg">{title}</h1>
            {description ? (
              <p className="block w-full max-w-none whitespace-normal break-words text-body-md text-on-surface-variant leading-relaxed mt-1">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-sm">{actions}</div>
          ) : null}
        </div>
      </div>
      <hr className="border-t border-outline-variant mt-4" />
    </header>
  );
}

