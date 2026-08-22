import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { FacilityForm } from "@/components/facilities/facility-form";
import { BlockDatesForm } from "@/components/facilities/block-dates-form";
import { getFacilityById } from "@/lib/facilities/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type EditFacilityPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditFacilityPage({ params }: EditFacilityPageProps) {
  const { id } = await params;
  const profile = await requireAdmin();
  const facility = await getFacilityById(id);

  if (!facility) {
    notFound();
  }

  if (facility.society_id !== profile.society_id) {
    notFound();
  }

  return (
    <>
      <div className="mb-lg">
        <Link
          href="/admin/facilities"
          className="inline-flex items-center gap-sm text-label-md text-on-surface-variant hover:text-primary transition-all"
        >
          <ChevronLeft className="size-4" />
          Back to facilities
        </Link>
      </div>

      <div className="space-y-xl">
        <div className="max-w-4xl space-y-md">
          <div className="mb-md">
            <h2 className="text-headline-lg text-on-surface">Edit Facility Details</h2>
            <p className="text-body-md text-on-surface-variant">
              Modify the configuration, name, description, rules, or photos for {facility.name}.
            </p>
          </div>

          <FacilityForm facility={facility} />
        </div>

        <div className="border-t border-outline-variant pt-xl">
          <div className="mb-lg">
            <h2 className="text-headline-md text-on-surface">Manage Availability Overrides</h2>
            <p className="text-body-md text-on-surface-variant">
              Temporarily block bookings for maintenance or community events.
            </p>
          </div>

          <BlockDatesForm facilityId={facility.id} blockedDates={facility.blocked_dates} />
        </div>
      </div>
    </>
  );
}
