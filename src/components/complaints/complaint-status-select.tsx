"use client";

import { useActionState, useEffect, useState } from "react";

import {
  updateComplaintStatusAction,
  type ComplaintActionState,
} from "@/lib/complaints/actions";
import { complaintStatusLabels } from "@/lib/complaints/constants";
import type { ComplaintStatus } from "@/types/ui";
import { complaintStatuses } from "@/types/ui";
import { cn } from "@/lib/utils";

const initialState: ComplaintActionState = {};

type ComplaintStatusSelectProps = {
  complaintId: string;
  currentStatus: ComplaintStatus;
  className?: string;
};

export function ComplaintStatusSelect({
  complaintId,
  currentStatus,
  className,
}: ComplaintStatusSelectProps) {
  const [state, formAction, isPending] = useActionState(updateComplaintStatusAction, initialState);
  const [status, setStatus] = useState<ComplaintStatus>(currentStatus);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  return (
    <form action={formAction} className={cn("flex flex-col gap-md", className)}>
      <input type="hidden" name="complaintId" value={complaintId} />
      <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-surface-container p-md">
        <span className="text-headline-sm text-on-surface">
          {complaintStatusLabels[currentStatus]}
        </span>
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
          className="rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm text-body-lg md:text-label-md"
        >
          {complaintStatuses.map((status) => (
            <option key={status} value={status}>
              {complaintStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>
      <textarea
        name="note"
        rows={2}
        placeholder="Optional note for timeline..."
        className="w-full resize-none rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-lg md:text-body-md"
      />
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-sm rounded-lg bg-secondary px-md py-md text-label-md text-on-secondary transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
      >
        {isPending ? "Updating..." : "Update Status"}
      </button>
      {state.error ? <p className="text-body-md text-error">{state.error}</p> : null}
      {state.success ? <p className="text-body-md text-primary">{state.success}</p> : null}
    </form>
  );
}
