import { redirect } from "next/navigation";

import { requireResident } from "@/lib/auth/session";
import { getNotifications } from "@/lib/notifications/queries";
import { NotificationsList } from "@/components/notifications/notifications-list";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const profile = await requireResident();

  if (!profile.society_id) {
    redirect("/onboarding");
  }

  // Fetch all user notifications
  const initialNotifications = await getNotifications(profile.id);

  return (
    <div className="space-y-xl max-w-container-max mx-auto px-margin-mobile sm:px-md py-md">
      {/* SECTION 1 — PAGE HEADER */}
      <div className="border-b border-outline-variant/60 pb-md">
        <div>
          <p className="text-label-md font-semibold text-primary uppercase tracking-wider">User Center</p>
          <h1 className="text-headline-lg font-bold text-on-surface mt-xs">Notifications</h1>
          <p className="text-body-md text-on-surface-variant mt-xs max-w-2xl leading-relaxed">
            Stay updated with activity related to your account, bookings, complaints, notices, and community updates.
          </p>
        </div>
      </div>

      {/* Notifications Interactive List Component */}
      <NotificationsList initialNotifications={initialNotifications} />
    </div>
  );
}
