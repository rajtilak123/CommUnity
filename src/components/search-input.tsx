"use client";

import { Search } from "lucide-react";
import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchInputProps = Omit<ComponentProps<typeof Input>, "type"> & {
  containerClassName?: string;
};

export function SearchInput({ className, containerClassName, ...props }: SearchInputProps) {
  return (
    <div className={cn("group relative w-full min-w-0", containerClassName)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary" />
      <Input className={cn("pl-11 w-full min-w-0", className)} type="search" {...props} />
    </div>
  );
}
