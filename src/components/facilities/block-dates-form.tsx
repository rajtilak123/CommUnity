"use client";

import { useActionState } from "react";
import { Loader2, CalendarX, AlertCircle, Clock } from "lucide-react";
import { blockFacilityDatesAction, type FacilityActionState } from "@/lib/facilities/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FacilityBlockedDate } from "@/types/facilities";

type BlockDatesFormProps = {
  facilityId: string;
  blockedDates: FacilityBlockedDate[];
};

const initialState: FacilityActionState = {};

export function BlockDatesForm({ facilityId, blockedDates }: BlockDatesFormProps) {
  const [state, formAction, isPending] = useActionState(blockFacilityDatesAction, initialState);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid grid-cols-1 gap-lg lg:grid-cols-3">
      {/* Block Dates Form */}
      <div className="lg:col-span-1 rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md md:p-lg shadow-sm h-fit">
        <div className="mb-md flex items-center gap-2">
          <CalendarX className="size-5 text-primary" />
          <h3 className="text-title-md font-bold text-on-surface">Block Date Range</h3>
        </div>

        <form action={formAction} className="flex flex-col gap-md">
          <input type="hidden" name="facility_id" value={facilityId} />

          <div className="flex flex-col gap-xs">
            <Label htmlFor="start_time" className="text-label-md text-on-surface-variant px-1">
              Start Time
            </Label>
            <Input
              id="start_time"
              name="start_time"
              type="datetime-local"
              required
              className="rounded-lg border-outline-variant bg-surface px-md py-sm text-body-md"
            />
          </div>

          <div className="flex flex-col gap-xs">
            <Label htmlFor="end_time" className="text-label-md text-on-surface-variant px-1">
              End Time
            </Label>
            <Input
              id="end_time"
              name="end_time"
              type="datetime-local"
              required
              className="rounded-lg border-outline-variant bg-surface px-md py-sm text-body-md"
            />
          </div>

          <div className="flex flex-col gap-xs">
            <Label htmlFor="reason" className="text-label-md text-on-surface-variant px-1">
              Reason / Event Description
            </Label>
            <Input
              id="reason"
              name="reason"
              placeholder="e.g. Annual Maintenance, Private Function"
              required
              className="rounded-lg border-outline-variant bg-surface px-md py-sm text-body-md"
            />
          </div>

          {state.error ? (
            <p className="rounded-lg border border-error/30 bg-error-container/40 px-md py-sm text-body-md text-on-error-container">
              {state.error}
            </p>
          ) : null}

          {state.success ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-md py-sm text-body-md text-emerald-700 dark:text-emerald-300">
              {state.success}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full gap-sm rounded-lg py-md text-body-md font-semibold mt-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Blocking...
              </>
            ) : (
              "Block Selected Dates"
            )}
          </Button>
        </form>
      </div>

      {/* Blocked Dates List */}
      <div className="lg:col-span-2 rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md md:p-lg shadow-sm">
        <div className="mb-md flex items-center gap-2">
          <Clock className="size-5 text-on-surface-variant" />
          <h3 className="text-title-md font-bold text-on-surface">Currently Blocked Schedules</h3>
        </div>

        {blockedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-xl border border-dashed border-outline-variant rounded-xl bg-surface">
            <AlertCircle className="size-8 text-on-surface-variant mb-2" />
            <p className="text-body-md font-semibold text-on-surface">No blocked dates set</p>
            <p className="text-label-md text-on-surface-variant text-center">
              This facility is open based on general community policies and booking availability.
            </p>
          </div>
        ) : (
          <div className="max-h-[360px] overflow-y-auto divide-y divide-outline-variant pr-md">
            {blockedDates
              .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
              .map((block) => (
                <div key={block.id} className="py-md first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
                  <div>
                    <h4 className="text-body-md font-semibold text-on-surface">{block.reason}</h4>
                    <p className="text-label-md text-on-surface-variant mt-1">
                      {formatDateTime(block.start_time)} &mdash; {formatDateTime(block.end_time)}
                    </p>
                  </div>
                  <div className="text-label-sm rounded bg-error/10 px-2 py-1 font-semibold text-error w-fit">
                    Blocked
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
