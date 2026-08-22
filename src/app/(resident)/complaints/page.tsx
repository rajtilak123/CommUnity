import { ComplaintsList } from "@/components/complaints/complaints-list";
import { getResidentComplaints } from "@/lib/complaints/queries";
import { requireResident } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ComplaintsPage() {
  const profile = await requireResident();
  const complaints = await getResidentComplaints(profile.id);

  const stats = {
    open: complaints.filter((c) => c.status === "open").length,
    in_progress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    high_priority: complaints.filter((c) => c.priority === "high" || c.priority === "urgent").length,
  };

  return <ComplaintsList complaints={complaints} stats={stats} />;
}

