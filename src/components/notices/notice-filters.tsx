"use client";

import { cn } from "@/lib/utils";
import { noticeCategoryLabels } from "@/lib/notices/constants";
import { noticeCategories, type NoticeCategory } from "@/types/notices";

type NoticeFiltersProps = {
  activeCategory: NoticeCategory | "all";
  onCategoryChange: (category: NoticeCategory | "all") => void;
  className?: string;
};

const filterOptions: Array<{ value: NoticeCategory | "all"; label: string }> = [
  { value: "all", label: "All Notices" },
  ...noticeCategories.map(cat => ({
    value: cat,
    label: noticeCategoryLabels[cat]
  }))
];

export function NoticeFilters({ activeCategory, onCategoryChange, className }: NoticeFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 py-1", className)}>
      {filterOptions.map((option) => {
        const isActive = activeCategory === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onCategoryChange(option.value)}
            className={cn(
              "h-8 w-fit shrink-0 whitespace-nowrap rounded-none px-3 font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer select-none",
              isActive
                ? "border border-[#111111] bg-[#111111] text-[#F9F9F7] dark:bg-[#F0EEE8] dark:text-[#0E0E0C]"
                : "border border-outline-variant bg-surface text-on-surface-variant hover:border-primary hover:text-on-surface"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
