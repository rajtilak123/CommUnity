import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-label-sm font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "border border-[#111111] text-[#111111] bg-transparent",
        secondary: "border border-[#A3A3A3] text-[#525252] bg-transparent",
        outline: "border border-[#E5E5E0] text-[#525252] bg-transparent",
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

