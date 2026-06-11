import { Check, CircleCheck } from "lucide-react";

import {
  complaintStatusLabels,
  formatComplaintDateTime,
} from "@/lib/complaints/constants";
import type { ComplaintStatusHistory } from "@/types/complaints";
import type { ComplaintStatus } from "@/types/ui";
import { cn } from "@/lib/utils";

type ComplaintTimelineProps = {
  history: ComplaintStatusHistory[];
  className?: string;
};

const statusTitles: Record<ComplaintStatus, string> = {
  open: "Complaint Created",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function ComplaintTimeline({ history, className }: ComplaintTimelineProps) {
  return (
    <section className={cn("rounded-[0.75rem] border border-outline-variant bg-surface-container-low p-lg", className)}>
      <h3 className="mb-lg text-headline-sm font-semibold text-on-surface">Status Timeline</h3>
      <div className="relative">
        <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-outline-variant md:left-1/2 md:-translate-x-1/2" />
        <div className="space-y-xl">
          {history.map((entry, index) => {
            const isLast = index === history.length - 1;
            const title =
              entry.old_status === null
                ? "Complaint Created"
                : statusTitles[entry.new_status] ?? complaintStatusLabels[entry.new_status];
            const alignRight = index % 2 === 0;

            return (
              <div key={entry.id} className="relative flex items-center md:justify-center">
                <div
                  className={cn(
                    "absolute left-0 z-10 flex size-8 items-center justify-center rounded-full md:left-1/2 md:-translate-x-1/2",
                    isLast ? "border-4 border-surface bg-secondary-container" : "bg-primary",
                  )}
                >
                  {isLast ? (
                    <CircleCheck className="size-[18px] text-on-secondary-container" />
                  ) : (
                    <Check className="size-[18px] text-on-primary" />
                  )}
                </div>

                <div
                  className={cn(
                    "ml-12 md:ml-0 md:w-1/2",
                    alignRight ? "md:pr-12 md:text-right" : "md:pl-12",
                    !alignRight && "md:order-2",
                  )}
                >
                  <h4 className="text-headline-sm font-bold text-on-surface">{title}</h4>
                  <p className="text-label-md text-on-surface-variant">
                    {formatComplaintDateTime(entry.created_at)}
                  </p>
                  {entry.note ? (
                    <p className="mt-xs text-body-md italic text-on-surface-variant">{entry.note}</p>
                  ) : null}
                </div>

                <div className={cn("hidden md:block md:w-1/2", alignRight ? "md:pl-12" : "md:pr-12")} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
