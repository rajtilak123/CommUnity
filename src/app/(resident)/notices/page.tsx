import { NoticesList } from "@/components/notices/notices-list";
import { getResidentNotices } from "@/lib/notices/queries";
import { requireResident } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const profile = await requireResident();
  const notices = await getResidentNotices(profile.id, profile.society_id || "");

  return <NoticesList notices={notices} />;
}
