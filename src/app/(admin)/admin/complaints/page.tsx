import { AdminComplaintsManager } from "@/components/complaints/admin-complaints-manager";
import { getAdminComplaints } from "@/lib/complaints/queries";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function resolveSocietyId(profileSocietyId: string | null): Promise<string> {
  if (profileSocietyId) {
    return profileSocietyId;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("societies").select("id").limit(1).single();
  return data?.id as string;
}

export default async function AdminComplaintsPage() {
  const profile = await requireAdmin();
  const societyId = await resolveSocietyId(profile.society_id);
  const complaints = await getAdminComplaints(societyId);

  return <AdminComplaintsManager complaints={complaints} />;
}
