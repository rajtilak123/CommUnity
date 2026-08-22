import Link from "next/link";
import { ChevronLeft, CalendarRange } from "lucide-react";

import { requireResident } from "@/lib/auth/session";
import { getResidentBookings } from "@/lib/facilities/queries";
import { BookingTable } from "@/components/facilities/booking-table";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function ResidentBookingsPage() {
  const profile = await requireResident();
  const bookings = await getResidentBookings(profile.id);

  return (
    <>
      <div className="mb-lg">
        <Link
          href="/facilities"
          className="inline-flex items-center gap-sm text-label-md text-on-surface-variant hover:text-primary"
        >
          <ChevronLeft className="size-4" />
          Back to facilities
        </Link>
      </div>

      <div className="mb-xl">
        <h2 className="text-headline-lg font-bold text-on-surface">My Reservations</h2>
        <p className="text-body-md text-on-surface-variant">
          Track the status of your reservation requests.
        </p>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No reservations found"
          description="You have not requested any facility bookings yet. Go back to facilities to request a slot."
        />
      ) : (
        <BookingTable bookings={bookings} />
      )}
    </>
  );
}
