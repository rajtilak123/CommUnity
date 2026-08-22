import { redirect } from "next/navigation";
import { AdminNoticesManager } from "@/components/notices/admin-notices-manager";
import { getAdminNotices } from "@/lib/notices/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminNoticesPage() {
  const profile = await requireAdmin();

  if (!profile.society_id) {
    redirect("/onboarding");
  }

  const notices = await getAdminNotices(profile.society_id);

  const stats = {
    published: notices.filter((n) => n.status === "published").length,
    drafts: notices.filter((n) => n.status === "draft").length,
    archived: notices.filter((n) => n.status === "archived").length,
    unread: 0,
  };

  return <AdminNoticesManager notices={notices} stats={stats} />;
}

