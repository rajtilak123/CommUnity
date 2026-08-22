import { redirect } from "next/navigation";
import { AdminComplaintsManager } from "@/components/complaints/admin-complaints-manager";
import { getAdminComplaints } from "@/lib/complaints/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminComplaintsPage() {
  const profile = await requireAdmin();

  if (!profile.society_id) {
    redirect("/onboarding");
  }

  const complaints = await getAdminComplaints(profile.society_id);

  return <AdminComplaintsManager complaints={complaints} />;
}
