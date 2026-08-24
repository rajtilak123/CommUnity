import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ResidentsList } from "@/components/residents/residents-list";
import { AddResidentDialog } from "@/components/residents/add-resident-dialog";
import { requireAdmin } from "@/lib/auth/session";
import { getResidentsList } from "@/lib/residents/queries";
import type { Profile } from "@/types/auth";

export const revalidate = 0; // Dynamic server component

export default async function AdminResidentsPage() {
  const profile = await requireAdmin();

  let residents: Profile[] = [];
  let errorMsg = null;


  if (profile.society_id) {
    try {
      residents = await getResidentsList(profile.society_id);
    } catch (e: unknown) {
      errorMsg = e instanceof Error ? e.message : "Failed to load residents list";
    }
  } else {
    errorMsg = "No society associated with your account.";
  }

  const breadcrumbs = (
    <div className="flex items-center gap-sm">
      <Link href="/admin" className="hover:underline">
        Admin
      </Link>
      <span>/</span>
      <span className="text-on-surface">Residents</span>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Residents Management"
        description="Manage registrations, assign housing units, adjust user roles, and activate/suspend resident accounts."
        breadcrumbs={breadcrumbs}
        actions={<AddResidentDialog />}
      />

      <div className="mt-lg">
        {errorMsg ? (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-md text-error">
            {errorMsg}
          </div>
        ) : (
          <ResidentsList residents={residents} />
        )}
      </div>
    </>
  );
}
