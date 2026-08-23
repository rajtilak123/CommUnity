import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  trend?: ReactNode;
  accent?: "primary" | "secondary" | "tertiary" | "error" | "default";
  className?: string;
};

const accentBorderStyles = {
  primary: "border-l-4 border-l-primary",
  secondary: "border-l-4 border-l-secondary",
  tertiary: "border-l-4 border-l-tertiary",
  error: "border-l-4 border-l-accent",
  default: "",
} as const;

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = "default",
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between p-5 bg-surface border border-outline-variant",
        accentBorderStyles[accent],
        className,
      )}
    >
      <div className="flex items-center justify-between">
        {Icon ? (
          <span className="text-on-surface-variant">
            <Icon className="size-4" />
          </span>
        ) : (
          <span />
        )}
        {trend ? <span className="font-mono text-[10px] text-on-surface-variant">{trend}</span> : null}
      </div>
      <div className="mt-4">
        <div className="font-mono text-4xl font-bold text-on-surface leading-none">{value}</div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</div>
      </div>
    </div>
  );
}

