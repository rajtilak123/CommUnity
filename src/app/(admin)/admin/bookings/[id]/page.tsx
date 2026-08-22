import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { BookingReviewForm } from "@/components/facilities/booking-review-form";
import { getBookingById } from "@/lib/facilities/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type BookingReviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookingReviewPage({ params }: BookingReviewPageProps) {
  const { id } = await params;
  const profile = await requireAdmin();
  const booking = await getBookingById(id);

  if (!booking) {
    notFound();
  }

  if (booking.society_id !== profile.society_id) {
    notFound();
  }

  return (
    <>
      <div className="mb-lg">
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-sm text-label-md text-on-surface-variant hover:text-primary transition-all"
        >
          <ChevronLeft className="size-4" />
          Back to Bookings List
        </Link>
      </div>

      <div className="space-y-xl">
        <div className="mb-md">
          <h2 className="text-headline-lg text-on-surface">Review Booking Request</h2>
          <p className="text-body-md text-on-surface-variant">
            Inspect the booking request, check notes, and either approve or reject with comments.
          </p>
        </div>

        <BookingReviewForm booking={booking} />
      </div>
    </>
  );
}
