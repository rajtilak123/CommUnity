"use client";

import { useTransition } from "react";
import { XCircle, Loader2 } from "lucide-react";

import type { BookingListItem } from "@/types/facilities";
import { bookingStatusColors, bookingStatusLabels, formatDateTime } from "@/lib/facilities/constants";
import { cancelBookingAction } from "@/lib/facilities/actions";
import { cn } from "@/lib/utils";

type BookingTableProps = {
  bookings: BookingListItem[];
  isAdmin?: boolean;
};

export function BookingTable({ bookings, isAdmin = false }: BookingTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = (id: string) => {
    if (confirm("Are you sure you want to cancel this booking request?")) {
      startTransition(async () => {
        const res = await cancelBookingAction(id);
        if (res.error) {
          alert(res.error);
        }
      });
    }
  };

  return (
    <div className="overflow-hidden rounded-[0.75rem] border border-outline-variant bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Facility
              </th>
              {isAdmin && (
                <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                  Resident
                </th>
              )}
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Time Slot
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Status
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Notes
              </th>
              {!isAdmin && (
                <th className="px-md py-4 text-right text-label-md uppercase tracking-wider text-on-surface-variant">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {bookings.map((booking) => {
              const statusColor = bookingStatusColors[booking.status];
              const statusLabel = bookingStatusLabels[booking.status];

              return (
                <tr key={booking.id} className="group transition-colors hover:bg-surface-container-low">
                  <td className="px-md py-4 text-body-md font-semibold text-on-surface">
                    {booking.facility?.name || "Facility"}
                  </td>
                  {isAdmin && (
                    <td className="px-md py-4">
                      <p className="text-body-md font-medium text-on-surface">
                        {booking.resident?.full_name || "Unknown"}
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        Unit: {booking.resident?.unit_label || "N/A"}
                      </p>
                    </td>
                  )}
                  <td className="px-md py-4 text-body-md text-on-surface-variant">
                    <p className="font-medium text-on-surface">{formatDateTime(booking.start_time)}</p>
                    <p className="text-[11px] mt-0.5">to {formatDateTime(booking.end_time)}</p>
                  </td>
                  <td className="px-md py-4">
                    <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-label-sm font-semibold capitalize", statusColor)}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-md py-4 text-body-md text-on-surface-variant max-w-xs truncate">
                    {booking.notes ? (
                      <p className="truncate" title={booking.notes}>
                        <span className="font-medium text-on-surface">Resident:</span> {booking.notes}
                      </p>
                    ) : null}
                    {booking.admin_notes ? (
                      <p className="truncate mt-0.5 text-primary" title={booking.admin_notes}>
                        <span className="font-medium">Admin:</span> {booking.admin_notes}
                      </p>
                    ) : null}
                    {!booking.notes && !booking.admin_notes && (
                      <span className="text-outline">—</span>
                    )}
                  </td>
                  {!isAdmin && (
                    <td className="px-md py-4 text-right">
                      {booking.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => handleCancel(booking.id)}
                          disabled={isPending}
                          className="inline-flex size-8 items-center justify-center rounded-full text-error hover:bg-error/10 transition-colors cursor-pointer disabled:opacity-50"
                          title="Cancel Booking"
                        >
                          {isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <XCircle className="size-5" />
                          )}
                        </button>
                      ) : (
                        <span className="text-outline text-label-md">—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
