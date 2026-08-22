"use client";

import { useActionState } from "react";
import { Loader2, CalendarPlus } from "lucide-react";

import { createBookingAction, type FacilityActionState } from "@/lib/facilities/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BookingFormProps = {
  facilityId: string;
};

const initialState: FacilityActionState = {};

export function BookingForm({ facilityId }: BookingFormProps) {
  const [state, formAction, isPending] = useActionState(createBookingAction, initialState);

  // Set default start time as today + 1 hour, end time as start time + 2 hours
  const defaultTimes = () => {
    const start = new Date();
    start.setHours(start.getHours() + 1, 0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 2);

    const pad = (n: number) => String(n).padStart(2, "0");
    const format = (d: Date) => {
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return {
      start: format(start),
      end: format(end),
    };
  };

  const times = defaultTimes();

  return (
    <form action={formAction} className="rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md md:p-lg shadow-sm flex flex-col gap-md">
      <div className="mb-xs">
        <h3 className="text-body-lg font-bold text-on-surface">Book Facility</h3>
        <p className="text-label-md text-on-surface-variant">Reserve your desired time slot.</p>
      </div>

      <input type="hidden" name="facility_id" value={facilityId} />

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <div className="flex flex-col gap-xs">
          <Label htmlFor="start_time" className="text-label-md text-on-surface-variant">
            Start Date &amp; Time
          </Label>
          <Input
            id="start_time"
            name="start_time"
            type="datetime-local"
            defaultValue={times.start}
            required
            className="rounded-lg border-outline-variant bg-surface px-md py-sm text-body-md"
          />
        </div>

        <div className="flex flex-col gap-xs">
          <Label htmlFor="end_time" className="text-label-md text-on-surface-variant">
            End Date &amp; Time
          </Label>
          <Input
            id="end_time"
            name="end_time"
            type="datetime-local"
            defaultValue={times.end}
            required
            className="rounded-lg border-outline-variant bg-surface px-md py-sm text-body-md"
          />
        </div>
      </div>

      <div className="flex flex-col gap-xs">
        <Label htmlFor="notes" className="text-label-md text-on-surface-variant">
          Booking Notes / Purpose (Optional)
        </Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="e.g., Playing tennis practice, hosting a small family gathering"
          className="w-full resize-none rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-lg md:text-body-md transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {state.error ? (
        <p className="rounded-lg border border-error/30 bg-error-container/40 px-md py-sm text-body-md text-on-error-container">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full gap-sm rounded-lg px-xl py-md font-semibold text-body-md h-auto mt-2"
      >
        {isPending ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Requesting...
          </>
        ) : (
          <>
            <CalendarPlus className="size-5" />
            Submit Reservation Request
          </>
        )}
      </Button>
    </form>
  );
}
