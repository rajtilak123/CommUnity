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
    <form action={formAction} className="rounded-none border border-outline-variant bg-surface p-md md:p-lg flex flex-col gap-md">
      <div className="border-b border-outline-variant pb-xs mb-xs">
        <h3 className="font-serif text-xl font-bold text-on-surface">Book Facility</h3>
        <p className="font-mono text-xs text-on-surface-variant">Reserve your desired time slot.</p>
      </div>

      <input type="hidden" name="facility_id" value={facilityId} />

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <div className="flex flex-col gap-xs">
          <Label htmlFor="start_time" className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Start Date &amp; Time
          </Label>
          <Input
            id="start_time"
            name="start_time"
            type="datetime-local"
            defaultValue={times.start}
            required
            className="font-mono text-xs"
          />
        </div>

        <div className="flex flex-col gap-xs">
          <Label htmlFor="end_time" className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            End Date &amp; Time
          </Label>
          <Input
            id="end_time"
            name="end_time"
            type="datetime-local"
            defaultValue={times.end}
            required
            className="font-mono text-xs"
          />
        </div>
      </div>

      <div className="flex flex-col gap-xs">
        <Label htmlFor="notes" className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          Booking Notes / Purpose (Optional)
        </Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="e.g., Playing tennis practice, hosting a small family gathering"
          className="w-full resize-none rounded-none border-0 border-b-2 border-outline-variant bg-transparent px-md py-2 text-body-md transition-all focus:border-primary focus:bg-surface-container-low focus:outline-none"
        />
      </div>

      {state.error ? (
        <p className="rounded-none border border-accent bg-accent/10 px-md py-sm font-mono text-xs text-accent">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        variant="default"
        size="lg"
        className="w-full gap-2 rounded-none border border-[#111111] bg-[#111111] text-[#F9F9F7] hover:bg-[#F9F9F7] hover:text-[#111111] font-mono text-xs font-bold uppercase tracking-wider h-11 mt-2 cursor-pointer transition-all"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin text-current" />
            Requesting...
          </>
        ) : (
          <>
            <CalendarPlus className="size-4 text-current" />
            Submit Reservation Request
          </>
        )}
      </Button>
    </form>
  );
}
