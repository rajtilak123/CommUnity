"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Home } from "lucide-react";

import { ComplaintImage } from "@/components/complaints/complaint-image";
import { PriorityBadge } from "@/components/priority-badge";
import { StatusBadge } from "@/components/status-badge";
import {
  formatComplaintDate,
  formatComplaintReference,
} from "@/lib/complaints/constants";
import type { ComplaintListItem } from "@/types/complaints";
import { cn } from "@/lib/utils";

type ComplaintCardProps = {
  complaint: ComplaintListItem;
  variant?: "featured" | "compact" | "sidebar";
  className?: string;
};

export function ComplaintCard({ complaint, variant = "compact", className }: ComplaintCardProps) {
  const href = `/complaints/${complaint.id}`;
  const image = complaint.attachments[0];
  const reference = formatComplaintReference(complaint.reference_code);

  if (variant === "featured") {
    return (
      <Link href={href} className={cn("group cursor-pointer lg:col-span-8", className)}>
        <div className="flex flex-col items-start gap-md rounded-[0.75rem] border border-outline-variant bg-surface p-md transition-all duration-300 hover:border-primary hover:shadow-lg md:flex-row md:p-lg">
          {image ? (
            <div className="h-32 w-full shrink-0 overflow-hidden rounded-lg bg-surface-container-high md:aspect-square md:h-auto md:w-48">
              <ComplaintImage path={image.file_url} alt={complaint.title} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
          ) : null}
          <div className="w-full flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-headline-sm text-on-surface transition-colors group-hover:text-primary">
                {complaint.title}
              </h3>
              <ArrowRight className="size-4 shrink-0 text-outline transition-colors group-hover:text-primary" />
            </div>
            <div className="flex flex-wrap gap-xs">
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
            <p className="line-clamp-2 text-body-md text-on-surface-variant">{complaint.description}</p>
            <div className="mt-2 flex items-center justify-between border-t border-outline-variant pt-2">
              <span className="flex items-center gap-1 text-label-md text-outline">
                <Calendar className="size-4" />
                {formatComplaintDate(complaint.created_at)}
              </span>
              <span className="text-label-md text-outline">Ref: {reference}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "sidebar") {
    return (
      <Link href={href} className={cn("group cursor-pointer lg:col-span-4", className)}>
        <div className="h-full rounded-[0.75rem] border border-outline-variant bg-surface-container-low p-md transition-all duration-300 hover:border-primary hover:bg-surface-container-high md:p-lg">
          <div className="mb-4 flex justify-between">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
          <h3 className="mb-2 text-headline-sm text-on-surface">{complaint.title}</h3>
          <p className="mb-4 text-body-md text-on-surface-variant">{complaint.description}</p>
          <div className="mt-auto flex items-center gap-3 pt-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary-container text-[12px] font-bold text-on-primary-container">
              M
            </div>
            <span className="text-label-md text-on-surface">Assigned to: Maintenance Dept</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className={cn("group cursor-pointer lg:col-span-6", className)}>
      <div className="rounded-[0.75rem] border border-outline-variant bg-surface p-md shadow-sm transition-all hover:border-primary">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary">
            <Home className="size-5" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-label-sm text-outline">{formatComplaintDate(complaint.created_at)}</span>
              <StatusBadge status={complaint.status} className="rounded-full px-2 py-0.5 text-[10px]" />
            </div>
            <h3 className="truncate text-body-lg font-semibold">{complaint.title}</h3>
          </div>
        </div>
      </div>
    </Link>
  );
}
