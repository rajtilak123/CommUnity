import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full border-0 border-b border-[#111111] rounded-none bg-transparent px-0 py-2.5 text-body-lg md:text-body-md text-[#111111] transition-colors",
        "placeholder:text-[#A3A3A3]",
        "focus-visible:outline-none focus-visible:border-b-2 focus-visible:border-[#111111]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
