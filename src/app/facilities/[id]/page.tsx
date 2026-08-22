import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, ScrollText, Users } from "lucide-react";

import { requireProfile } from "@/lib/auth/session";
import { getFacilityById, getFacilityAvailabilityCalendar } from "@/lib/facilities/queries";
import { BookingCalendar } from "@/components/facilities/booking-calendar";
import { BookingForm } from "@/components/facilities/booking-form";
import { FacilityImageGallery } from "@/components/facilities/facility-image-gallery";

export const dynamic = "force-dynamic";

type FacilityDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FacilityDetailPage({ params }: FacilityDetailPageProps) {
  const { id } = await params;
  const profile = await requireProfile();
  if (profile.role !== "resident" && profile.role !== "admin") {
    redirect("/login");
  }
  const facility = await getFacilityById(id);

  if (
    !facility ||
    facility.society_id !== profile.society_id ||
    (!facility.is_active && profile.role !== "admin")
  ) {
    notFound();
  }

  // Fetch only masked availability data to protect resident privacy on the calendar
  const calendarBookings = await getFacilityAvailabilityCalendar(facility.id);

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

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        {/* Left Column: Facility Information & Images (Bento Grid Style) */}
        <div className="lg:col-span-2 space-y-lg">
          {/* Details Bento Box */}
          <section className="rounded-[0.75rem] border border-outline-variant bg-surface p-md md:p-lg space-y-md">
            <div>
              <div className="mb-sm flex flex-wrap items-center gap-xs text-label-sm font-semibold uppercase tracking-wider text-primary">
                <span className="rounded bg-surface-container-high px-2 py-0.5 text-on-surface-variant font-medium">
                  Amenity
                </span>
                <span className="rounded bg-surface-container-high px-2 py-0.5 text-on-surface-variant font-medium flex items-center gap-1">
                  <Users className="size-3" />
                  Capacity: {facility.capacity}
                </span>
              </div>
              <h2 className="text-headline-md font-bold text-on-surface leading-tight">
                {facility.name}
              </h2>
            </div>

            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              {facility.description}
            </p>

            <FacilityImageGallery images={facility.images} facilityName={facility.name} />
          </section>

          {/* Rules Bento Box */}
          {facility.rules ? (
            <section className="rounded-[0.75rem] border border-outline-variant bg-surface-container/30 p-md md:p-lg space-y-sm">
              <div className="flex items-center gap-2 text-primary font-bold">
                <ScrollText className="size-5" />
                <h3 className="text-body-lg">Booking &amp; Usage Rules</h3>
              </div>
              <div className="whitespace-pre-line text-body-md text-on-surface-variant leading-relaxed">
                {facility.rules}
              </div>
            </section>
          ) : null}
        </div>

        {/* Right Column: Calendar & Booking Form */}
        <div className="space-y-lg">
          <BookingCalendar bookings={calendarBookings} blockedDates={facility.blocked_dates} />
          <BookingForm facilityId={facility.id} />
        </div>
      </div>
    </>
  );
}
