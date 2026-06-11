"use client";

import { cn } from "@/lib/utils";
import { complaintStatusFilterOptions } from "@/lib/complaints/constants";
import type { ComplaintStatus } from "@/types/ui";

type ComplaintFiltersProps = {
  activeStatus: ComplaintStatus | "all";
  onStatusChange: (status: ComplaintStatus | "all") => void;
  className?: string;
};

export function ComplaintFilters({ activeStatus, onStatusChange, className }: ComplaintFiltersProps) {
  return (
    <div className={cn("flex gap-sm overflow-x-auto pb-2", className)}>
      {complaintStatusFilterOptions.map((option) => {
        const isActive = activeStatus === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatusChange(option.value)}
            className={cn(
              "whitespace-nowrap rounded-full px-md py-2 text-label-md transition-all",
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
