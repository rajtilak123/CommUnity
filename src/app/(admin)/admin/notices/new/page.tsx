import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NoticeForm } from "@/components/notices/notice-form";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewNoticePage() {
  await requireAdmin();

  return (
    <>
      <div className="mb-lg">
        <Link
          href="/admin/notices"
          className="inline-flex items-center gap-sm text-label-md text-on-surface-variant hover:text-primary"
        >
          <ChevronLeft className="size-4" />
          Back to notices
        </Link>
      </div>

      <div className="max-w-4xl space-y-md">
        <div className="mb-md">
          <h2 className="text-headline-lg text-on-surface">Create Notice</h2>
          <p className="text-body-md text-on-surface-variant">
            Draft or publish a new announcement for the society residents.
          </p>
        </div>

        <NoticeForm />
      </div>
    </>
  );
}
