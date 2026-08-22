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
    <div className={cn("flex gap-sm overflow-x-auto pb-2 scrollbar-none", className)}>
      {filterOptions.map((option) => {
        const isActive = activeCategory === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onCategoryChange(option.value)}
            className={cn(
              "whitespace-nowrap rounded-full px-md py-2 text-label-md font-semibold transition-all cursor-pointer",
              isActive
                ? "bg-primary text-on-primary shadow-sm"
                : "border border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-high",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
