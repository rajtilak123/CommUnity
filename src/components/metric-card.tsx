import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  trend?: ReactNode;
  accent?: "primary" | "secondary" | "tertiary" | "error" | "default";
  className?: string;
};

const accentStyles = {
  primary: "hover:border-primary",
  secondary: "hover:border-secondary",
  tertiary: "hover:border-tertiary",
  error: "hover:border-error",
  default: "hover:border-outline",
} as const;

const iconAccentStyles = {
  primary: "bg-primary-fixed text-primary",
  secondary: "bg-secondary-fixed text-secondary",
  tertiary: "bg-tertiary-fixed text-tertiary",
  error: "bg-error-container text-error",
  default: "bg-surface-container-high text-on-surface-variant",
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
    <Card
      className={cn(
        "flex flex-col justify-between p-lg transition-colors",
        accentStyles[accent],
        className,
      )}
    >
      <div className="flex items-center justify-between">
        {Icon ? (
          <span className={cn("rounded-lg p-xs", iconAccentStyles[accent])}>
            <Icon className="size-5" />
          </span>
        ) : (
          <span />
        )}
        {trend ? <span className="text-label-sm">{trend}</span> : null}
      </div>
      <div className="mt-xl">
        <div className="text-display-lg text-on-surface">{value}</div>
        <div className="mt-1 text-label-md uppercase tracking-wider text-on-surface-variant">{label}</div>
      </div>
    </Card>
  );
}
