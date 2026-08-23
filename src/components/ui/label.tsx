import type { LabelHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-[10px] font-mono font-medium uppercase tracking-widest text-[#737373]", className)}
      {...props}
    />
  );
}

