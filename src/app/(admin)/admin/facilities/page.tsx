import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminFacilities } from "@/lib/facilities/queries";
import { AdminFacilitiesManager } from "@/components/facilities/admin-facilities-manager";

export const dynamic = "force-dynamic";

export default async function AdminFacilitiesPage() {
  const profile = await requireAdmin();

  if (!profile.society_id) {
    redirect("/onboarding");
  }

  const facilities = await getAdminFacilities(profile.society_id);

  return <AdminFacilitiesManager facilities={facilities} />;
}
