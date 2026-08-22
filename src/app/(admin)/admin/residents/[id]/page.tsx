import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ResidentDetailView } from "@/components/residents/resident-detail-view";
import { requireAdmin } from "@/lib/auth/session";
import { getResidentById, getSocietyById } from "@/lib/residents/queries";

type AdminResidentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const revalidate = 0; // Dynamic server component

export default async function AdminResidentDetailPage({ params }: AdminResidentDetailPageProps) {
  const admin = await requireAdmin();
  const { id } = await params;

  const resident = await getResidentById(id);

  // Strict check: Resident must exist and belong to the same society as the admin
  if (!resident || resident.society_id !== admin.society_id) {
    notFound();
  }

  // Fetch society name if resident has a society_id
  let societyName = "Unknown Society";
  if (resident.society_id) {
    const society = await getSocietyById(resident.society_id);
    if (society) {
      societyName = society.name;
    }
  }

  const breadcrumbs = (
    <div className="flex items-center gap-sm">
      <Link href="/admin" className="hover:underline">
        Admin
      </Link>
      <span>/</span>
      <Link href="/admin/residents" className="hover:underline">
        Residents
      </Link>
      <span>/</span>
      <span className="text-on-surface truncate max-w-[150px] inline-block align-bottom">
        {resident.full_name || resident.email}
      </span>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Resident Details"
        description="Review and modify approval status, role authorizations, active status, and unit designations."
        breadcrumbs={breadcrumbs}
      />

      <div className="mt-lg">
        <ResidentDetailView resident={resident} societyName={societyName} />
      </div>
    </>
  );
}
