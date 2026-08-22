import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FacilityForm } from "@/components/facilities/facility-form";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewFacilityPage() {
  await requireAdmin();

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

      <div className="max-w-4xl space-y-md">
        <div className="mb-md">
          <h2 className="text-headline-lg text-on-surface">Create Facility</h2>
          <p className="text-body-md text-on-surface-variant">
            Set up a new shared amenity or community area for booking.
          </p>
        </div>

        <FacilityForm />
      </div>
    </>
  );
}
