import { createClient } from "@/lib/supabase/server";

export async function getSettingsData(userId: string, societyId: string) {
  const supabase = await createClient();

  const [
    societyResult,
    adminProfileResult,
    invitationsResult,
    residentsCountResult,
    facilitiesCountResult,
  ] = await Promise.all([
    // 1. Get Society Info
    supabase
      .from("societies")
      .select("*")
      .eq("id", societyId)
      .single(),

    // 2. Get Admin Profile
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single(),

    // 3. Get Invitation History
    supabase
      .from("invitations")
      .select(`
        *,
        redeemed_by_profile:profiles!redeemed_by(id, full_name, email)
      `)
      .eq("society_id", societyId)
      .order("created_at", { ascending: false }),

    // 4. Get Residents Count
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("society_id", societyId)
      .eq("role", "resident"),

    // 5. Get Facilities Count
    supabase
      .from("facilities")
      .select("id", { count: "exact", head: true })
      .eq("society_id", societyId),
  ]);

  if (adminProfileResult.error) {
    throw new Error(adminProfileResult.error.message);
  }

  return {
    society: societyResult.data ?? null,
    adminProfile: adminProfileResult.data,
    invitations: invitationsResult.data ?? [],
    stats: {
      totalResidents: residentsCountResult.count ?? 0,
      totalFacilities: facilitiesCountResult.count ?? 0,
    },
  };
}
