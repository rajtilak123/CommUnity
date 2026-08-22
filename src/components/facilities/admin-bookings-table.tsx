"use client";

import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";
import type { BookingListItem } from "@/types/facilities";
import { bookingStatusColors, bookingStatusLabels, formatDateTime } from "@/lib/facilities/constants";
import { cn } from "@/lib/utils";

type AdminBookingsTableProps = {
  bookings: BookingListItem[];
  className?: string;
};

export function AdminBookingsTable({ bookings, className }: AdminBookingsTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Resident
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Facility
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Scheduled Slot
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Status
              </th>
              <th className="px-md py-4 text-right text-label-md uppercase tracking-wider text-on-surface-variant">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {bookings.map((booking) => {
              const statusColor = bookingStatusColors[booking.status];
              const statusLabel = bookingStatusLabels[booking.status];

              return (
                <tr key={booking.id} className="group transition-colors hover:bg-surface-container-high">
                  <td className="px-md py-4">
                    <p className="text-body-md font-semibold text-on-surface">
                      {booking.resident?.full_name || "Unknown Profile"}
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Unit: {booking.resident?.unit_label || "N/A"}
                    </p>
                  </td>
                  <td className="px-md py-4 text-body-md font-medium text-on-surface">
                    {booking.facility?.name || "Facility"}
                  </td>
                  <td className="px-md py-4 text-body-md text-on-surface-variant">
                    <p className="font-semibold text-on-surface">{formatDateTime(booking.start_time)}</p>
                    <p className="text-[11px] mt-0.5">to {formatDateTime(booking.end_time)}</p>
                  </td>
                  <td className="px-md py-4">
                    <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-label-sm font-semibold capitalize", statusColor)}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-md py-4 text-right">
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className={cn(
                        "inline-flex h-9 items-center justify-center rounded-lg px-3 text-label-md font-semibold transition-all shadow-sm",
                        booking.status === "pending"
                          ? "bg-primary text-on-primary hover:bg-primary/95"
                          : "border border-outline bg-surface text-on-surface hover:bg-surface-container"
                      )}
                    >
                      {booking.status === "pending" ? (
                        <>
                          Review
                          <ArrowRight className="ml-1.5 size-4" />
                        </>
                      ) : (
                        <>
                          View Detail
                          <Eye className="ml-1.5 size-4" />
                        </>
                      )}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
