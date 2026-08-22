"use client";

import { useState, useMemo } from "react";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";

import type { FacilityBooking, FacilityBlockedDate } from "@/types/facilities";
import { cn } from "@/lib/utils";

type BookingCalendarProps = {
  bookings: Pick<FacilityBooking, "start_time" | "end_time" | "status">[];
  blockedDates: Pick<FacilityBlockedDate, "start_time" | "end_time" | "reason">[];
};

export function BookingCalendar({ bookings, blockedDates }: BookingCalendarProps) {
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Generate next 7 days for the date selector tabs
  const dateTabs = useMemo(() => {
    const tabs = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const isoString = date.toISOString().split("T")[0];
      const label = date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      tabs.push({ isoString, label });
    }
    return tabs;
  }, []);

  // Filter bookings and blocked slots for the selected date
  const selectedDayEvents = useMemo(() => {
    const targetDate = new Date(selectedDateStr);
    const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));

    const dayBookings = bookings.filter((b) => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return start < dayEnd && end > dayStart;
    });

    const dayBlocked = blockedDates.filter((b) => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return start < dayEnd && end > dayStart;
    });

    const events: { start: Date; end: Date; type: "booked" | "blocked"; label: string }[] = [];

    dayBookings.forEach((b) => {
      events.push({
        start: new Date(b.start_time),
        end: new Date(b.end_time),
        type: "booked",
        label: `Reserved (${b.status})`,
      });
    });

    dayBlocked.forEach((b) => {
      events.push({
        start: new Date(b.start_time),
        end: new Date(b.end_time),
        type: "blocked",
        label: `Blocked: ${b.reason}`,
      });
    });

    // Sort events by start time
    return events.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [bookings, blockedDates, selectedDateStr]);

  const formatHourRange = (start: Date, end: Date) => {
    const formatTime = (d: Date) => {
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    };
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  return (
    <div className="rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
      <div className="mb-md flex items-center gap-2 px-1">
        <Calendar className="size-5 text-primary" />
        <h3 className="text-body-lg font-bold text-on-surface">Availability Schedule</h3>
      </div>

      {/* Date Horizontal selector */}
      <div className="flex gap-sm overflow-x-auto pb-sm scrollbar-none border-b border-outline-variant/60 mb-md">
        {dateTabs.map((tab) => {
          const isSelected = tab.isoString === selectedDateStr;
          return (
            <button
              key={tab.isoString}
              type="button"
              onClick={() => setSelectedDateStr(tab.isoString)}
              className={cn(
                "flex min-w-[70px] flex-col items-center gap-1.5 rounded-lg border py-2 px-3 transition-all cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                  : "border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low"
              )}
            >
              <span className="text-[11px] uppercase tracking-wider">{tab.label.split(" ")[0]}</span>
              <span className="text-headline-sm leading-none font-bold">{tab.label.split(" ")[1]}</span>
            </button>
          );
        })}
      </div>

      {/* Timeline Schedule for Selected Date */}
      <div className="space-y-sm">
        {selectedDayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-on-surface-variant">
            <CheckCircle2 className="size-8 text-emerald-500 mb-2" />
            <p className="text-body-md font-semibold">Available all day</p>
            <p className="text-label-md text-outline">Select your desired hours in the form to book.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-outline-variant/80 ml-3 pl-6 py-1 space-y-md">
            {selectedDayEvents.map((event, index) => {
              const isBlocked = event.type === "blocked";
              return (
                <div key={index} className="relative group">
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute -left-[31px] top-1.5 flex size-4 items-center justify-center rounded-full border-2 bg-surface",
                    isBlocked ? "border-error text-error" : "border-amber-500 text-amber-500"
                  )}>
                    <div className={cn("size-1.5 rounded-full", isBlocked ? "bg-error" : "bg-amber-500")} />
                  </div>

                  <div className={cn(
                    "rounded-lg border p-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2",
                    isBlocked 
                      ? "border-error/20 bg-error/5 text-error" 
                      : "border-amber-500/20 bg-amber-500/5 text-on-surface"
                  )}>
                    <div className="flex items-center gap-sm">
                      <Clock className="size-4 shrink-0 text-outline-variant" />
                      <div>
                        <p className="text-body-md font-bold leading-tight">
                          {formatHourRange(event.start, event.end)}
                        </p>
                        <p className={cn("text-label-md mt-0.5 font-medium", isBlocked ? "text-error" : "text-on-surface-variant")}>
                          {event.label}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
