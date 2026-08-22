"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, User, Clock, FileText, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { processBookingAction } from "@/lib/facilities/actions";
import { bookingStatusColors, bookingStatusLabels, formatDateTime } from "@/lib/facilities/constants";
import type { BookingWithRelations } from "@/types/facilities";
import { cn } from "@/lib/utils";

type BookingReviewFormProps = {
  booking: BookingWithRelations;
};

export function BookingReviewForm({ booking }: BookingReviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [adminNotes, setAdminNotes] = useState(booking.admin_notes || "");
  const [error, setError] = useState<string | null>(null);

  const handleAction = (status: "approved" | "rejected") => {
    setError(null);
    startTransition(async () => {
      const res = await processBookingAction(booking.id, status, adminNotes);
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
        router.push("/admin/bookings");
      }
    });
  };

  const statusColor = bookingStatusColors[booking.status];
  const statusLabel = bookingStatusLabels[booking.status];

  // Calculate duration
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);
  const durationHours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60) * 10) / 10;

  return (
    <div className="space-y-lg">
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-md rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md md:p-lg shadow-sm">
        <div className="flex items-center gap-md">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Calendar className="size-6" />
          </div>
          <div>
            <h3 className="text-title-lg font-bold text-on-surface">
              Reservation for {booking.facility?.name}
            </h3>
            <p className="text-label-md text-on-surface-variant mt-0.5">
              Requested {new Date(booking.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div>
          <span className={cn("inline-block rounded-full border px-3 py-1 text-body-md font-semibold capitalize", statusColor)}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
        {/* Left Side: Booking details & notes */}
        <div className="md:col-span-2 space-y-lg">
          {/* Reservation Card */}
          <div className="rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md md:p-lg shadow-sm">
            <h4 className="text-title-md font-bold text-on-surface mb-md pb-xs border-b border-outline-variant flex items-center gap-sm">
              <Clock className="size-4 text-on-surface-variant" />
              Schedules &amp; Booking Details
            </h4>
            
            <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
              <div>
                <p className="text-label-md text-on-surface-variant font-medium">Start Time</p>
                <p className="text-body-md text-on-surface font-semibold mt-1">
                  {formatDateTime(booking.start_time)}
                </p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-medium">End Time</p>
                <p className="text-body-md text-on-surface font-semibold mt-1">
                  {formatDateTime(booking.end_time)}
                </p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-medium">Total Duration</p>
                <p className="text-body-md text-on-surface font-semibold mt-1">
                  {durationHours} Hours
                </p>
              </div>
            </div>

            {booking.notes && (
              <div className="mt-lg rounded-lg bg-surface-container-low p-md">
                <p className="text-label-md text-on-surface-variant font-bold">Resident Special Request / Notes:</p>
                <p className="text-body-md text-on-surface mt-1 italic">&ldquo;{booking.notes}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Decision Form Card */}
          {booking.status === "pending" ? (
            <div className="rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md md:p-lg shadow-sm">
              <h4 className="text-title-md font-bold text-on-surface mb-md pb-xs border-b border-outline-variant flex items-center gap-sm">
                <FileText className="size-4 text-on-surface-variant" />
                Process Booking Request
              </h4>

              <div className="flex flex-col gap-xs mb-lg">
                <Label htmlFor="admin_notes" className="text-label-md text-on-surface-variant px-1">
                  Admin Remarks / Approver Notes (Optional)
                </Label>
                <textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add details, instructions, pick-up code, or rejection reasons here..."
                  rows={4}
                  className="min-h-[100px] w-full resize-none rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-lg md:text-body-md transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-error/30 bg-error-container/40 px-md py-sm text-body-md text-on-error-container mb-lg">
                  {error}
                </p>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-sm border-t border-outline-variant pt-lg">
                <Button
                  onClick={() => handleAction("rejected")}
                  disabled={isPending}
                  variant="secondary"
                  className="h-auto border-error text-error hover:bg-error-container/20 rounded-lg px-2xl py-md text-body-md font-semibold"
                >
                  <XCircle className="mr-1.5 size-5" />
                  Reject Request
                </Button>

                <Button
                  onClick={() => handleAction("approved")}
                  disabled={isPending}
                  className="h-auto bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg px-2xl py-md text-body-md font-semibold"
                >
                  <CheckCircle2 className="mr-1.5 size-5" />
                  Approve Booking
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md md:p-lg shadow-sm">
              <h4 className="text-title-md font-bold text-on-surface mb-md pb-xs border-b border-outline-variant flex items-center gap-sm">
                <FileText className="size-4 text-on-surface-variant" />
                Resolution Details
              </h4>
              
              <div className="space-y-md">
                {booking.approver && (
                  <div>
                    <p className="text-label-md text-on-surface-variant">Processed By</p>
                    <p className="text-body-md text-on-surface font-semibold mt-0.5">
                      {booking.approver.full_name || booking.approver.email || "System Admin"}
                    </p>
                  </div>
                )}
                {booking.admin_notes ? (
                  <div>
                    <p className="text-label-md text-on-surface-variant font-bold">Feedback / Remarks:</p>
                    <p className="text-body-md text-on-surface mt-1 bg-surface-container px-md py-sm rounded-lg">
                      {booking.admin_notes}
                    </p>
                  </div>
                ) : (
                  <p className="text-body-md text-on-surface-variant italic">No remarks were left by the admin.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Resident Information Panel */}
        <div className="md:col-span-1">
          <div className="rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md md:p-lg shadow-sm">
            <h4 className="text-title-md font-bold text-on-surface mb-md pb-xs border-b border-outline-variant flex items-center gap-sm">
              <User className="size-4 text-on-surface-variant" />
              Resident Profile
            </h4>

            <div className="space-y-md">
              <div>
                <p className="text-label-md text-on-surface-variant">Full Name</p>
                <p className="text-body-md text-on-surface font-semibold mt-0.5">
                  {booking.resident?.full_name || "Unknown Resident"}
                </p>
              </div>

              <div>
                <p className="text-label-md text-on-surface-variant">Unit Label</p>
                <p className="text-body-md text-on-surface font-semibold mt-0.5">
                  {booking.resident?.unit_label || "No unit details"}
                </p>
              </div>

              <div>
                <p className="text-label-md text-on-surface-variant">Email</p>
                <p className="text-body-md text-on-surface mt-0.5 break-all">
                  {booking.resident?.email || "N/A"}
                </p>
              </div>

              {booking.resident?.phone && (
                <div>
                  <p className="text-label-md text-on-surface-variant">Phone Number</p>
                  <p className="text-body-md text-on-surface mt-0.5">
                    {booking.resident.phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
