import { ComplaintsList } from "@/components/complaints/complaints-list";
import { getResidentComplaintStats, getResidentComplaints } from "@/lib/complaints/queries";
import { requireResident } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ComplaintsPage() {
  const profile = await requireResident();
  const [complaints, stats] = await Promise.all([
    getResidentComplaints(profile.id),
    getResidentComplaintStats(profile.id),
  ]);

  return <ComplaintsList complaints={complaints} stats={stats} />;
}
