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
          className="inline-flex items-center gap-1 font-mono text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to facilities
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        {/* Left Column: Facility Information & Images */}
        <div className="lg:col-span-7 space-y-lg">
          {/* Details Box */}
          <section className="rounded-none border border-outline-variant bg-surface p-md md:p-lg space-y-md">
            <div>
              <div className="mb-sm flex flex-wrap items-center gap-xs font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                <span className="border border-outline-variant px-2 py-0.5 text-on-surface-variant">
                  Amenity
                </span>
                <span className="border border-outline-variant px-2 py-0.5 text-on-surface-variant flex items-center gap-1">
                  <Users className="size-3" />
                  Capacity: {facility.capacity}
                </span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-on-surface leading-tight">
                {facility.name}
              </h2>
            </div>

            <p className="text-body-md text-on-surface-variant leading-relaxed">
              {facility.description}
            </p>

            <FacilityImageGallery images={facility.images} facilityName={facility.name} />
          </section>

          {/* Rules Box */}
          {facility.rules ? (
            <section className="rounded-none border border-outline-variant bg-surface-container-low p-md md:p-lg space-y-sm">
              <div className="flex items-center gap-2 text-primary font-bold">
                <ScrollText className="size-4" />
                <h3 className="font-serif text-lg">Booking &amp; Usage Rules</h3>
              </div>
              <div className="whitespace-pre-line text-body-md text-on-surface-variant leading-relaxed font-mono text-xs">
                {facility.rules}
              </div>
            </section>
          ) : null}
        </div>

        {/* Right Column: Calendar & Booking Form */}
        <div className="lg:col-span-5 space-y-lg">
          <BookingCalendar bookings={calendarBookings} blockedDates={facility.blocked_dates} />
          <BookingForm facilityId={facility.id} />
        </div>
      </div>
    </>
  );
}
