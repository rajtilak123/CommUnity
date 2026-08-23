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
    <div className="rounded-none border border-outline-variant bg-surface p-md">
      <div className="mb-md flex items-center gap-2 border-b border-outline-variant pb-xs">
        <Calendar className="size-4 text-primary" />
        <h3 className="font-serif text-lg font-bold text-on-surface">Availability Schedule</h3>
      </div>

      {/* Date Horizontal selector */}
      <div className="flex gap-sm overflow-x-auto pb-sm scrollbar-none border-b border-outline-variant mb-md">
        {dateTabs.map((tab) => {
          const isSelected = tab.isoString === selectedDateStr;
          return (
            <button
              key={tab.isoString}
              type="button"
              onClick={() => setSelectedDateStr(tab.isoString)}
              className={cn(
                "flex min-w-[65px] flex-col items-center gap-1 rounded-none border py-2 px-3 transition-all cursor-pointer select-none",
                isSelected
                  ? "border-[#111111] bg-[#111111] text-[#F9F9F7] dark:bg-[#F0EEE8] dark:text-[#0E0E0C]"
                  : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary hover:text-on-surface"
              )}
            >
              <span className="font-mono text-[10px] uppercase tracking-wider">{tab.label.split(" ")[0]}</span>
              <span className="font-mono text-sm leading-none font-bold">{tab.label.split(" ")[1]}</span>
            </button>
          );
        })}
      </div>

      {/* Timeline Schedule for Selected Date */}
      <div className="space-y-sm">
        {selectedDayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-on-surface-variant">
            <CheckCircle2 className="size-6 text-primary mb-2" />
            <p className="font-serif text-base font-bold text-on-surface">Available All Day</p>
            <p className="font-mono text-xs text-outline mt-1">Select your desired hours below to book.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-primary ml-3 pl-4 py-1 space-y-sm">
            {selectedDayEvents.map((event, index) => {
              const isBlocked = event.type === "blocked";
              return (
                <div key={index} className="relative group">
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute -left-[21px] top-2 flex size-2.5 items-center justify-center rounded-none border",
                    isBlocked ? "border-accent bg-accent" : "border-primary bg-primary"
                  )} />

                  <div className={cn(
                    "rounded-none border p-sm flex flex-col md:flex-row md:items-center justify-between gap-2",
                    isBlocked 
                      ? "border-accent/30 bg-accent/5 text-accent" 
                      : "border-outline-variant bg-surface-container-low text-on-surface"
                  )}>
                    <div className="flex items-center gap-sm">
                      <Clock className="size-4 shrink-0 text-outline" />
                      <div>
                        <p className="font-mono text-xs font-bold leading-tight">
                          {formatHourRange(event.start, event.end)}
                        </p>
                        <p className={cn("text-xs font-mono mt-0.5", isBlocked ? "text-accent" : "text-on-surface-variant")}>
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
