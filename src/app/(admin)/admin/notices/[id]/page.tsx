import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { NoticeForm } from "@/components/notices/notice-form";
import { getNoticeById } from "@/lib/notices/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type EditNoticePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditNoticePage({ params }: EditNoticePageProps) {
  const { id } = await params;
  const profile = await requireAdmin();
  const notice = await getNoticeById(id);

  if (!notice) {
    notFound();
  }

  if (notice.society_id !== profile.society_id) {
    notFound();
  }

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
          <h2 className="text-headline-lg text-on-surface">Edit Notice</h2>
          <p className="text-body-md text-on-surface-variant">
            Update or republish the notice announcement.
          </p>
        </div>

        <NoticeForm notice={notice} />
      </div>
    </>
  );
}
