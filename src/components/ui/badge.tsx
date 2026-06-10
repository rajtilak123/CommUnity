import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-container/10 text-primary-container",
        secondary: "bg-surface-container text-on-surface-variant",
        outline: "border border-outline-variant text-on-surface-variant",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
