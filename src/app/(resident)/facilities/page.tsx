import Link from "next/link";
import { Megaphone, CalendarRange } from "lucide-react";

import { requireResident } from "@/lib/auth/session";
import { getResidentFacilities } from "@/lib/facilities/queries";
import { FacilityCard } from "@/components/facilities/facility-card";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function FacilitiesPage() {
  const profile = await requireResident();
  const facilities = await getResidentFacilities(profile.society_id || "");

  return (
    <>
      {/* Page Header */}
      <div className="mb-xl flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Facilities Booking</h2>
          <p className="text-body-md text-on-surface-variant">
            Reserve amenities and common spaces in your community.
          </p>
        </div>
        <div>
          <Link
            href="/facilities/bookings"
            className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-high px-md py-2.5 text-label-md font-semibold text-primary hover:bg-surface-container-highest shadow-sm transition-all"
          >
            <CalendarRange className="size-4" />
            My Bookings
          </Link>
        </div>
      </div>

      {/* Facilities Grid */}
      {facilities.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No facilities available"
          description="There are no active facilities configured for booking in your society at this time."
        />
      ) : (
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <FacilityCard key={facility.id} facility={facility} />
          ))}
        </div>
      )}
    </>
  );
}
