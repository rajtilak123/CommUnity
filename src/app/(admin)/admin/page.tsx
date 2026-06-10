import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminHomePage() {
  const profile = await requireAdmin();

  return (
    <>
      <PageHeader
        title="Admin Portal"
        description={`Signed in as ${profile.full_name ?? profile.email}. Feature modules will be added in upcoming phases.`}
      />

      <Card className="p-lg">
        <p className="text-body-md text-on-surface-variant">
          Authentication and authorization are active. Complaints, notices, facilities, and dashboards
          are not implemented yet.
        </p>
      </Card>
    </>
  );
}
