import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminBookings } from "@/lib/facilities/queries";
import { AdminBookingsManager } from "@/components/facilities/admin-bookings-manager";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const profile = await requireAdmin();

  if (!profile.society_id) {
    redirect("/onboarding");
  }

  const bookings = await getAdminBookings(profile.society_id);

  return <AdminBookingsManager bookings={bookings} />;
}
