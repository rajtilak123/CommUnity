import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Tags } from "lucide-react";

import { ComplaintCommentThread } from "@/components/complaints/complaint-comment-thread";
import { ComplaintImage } from "@/components/complaints/complaint-image";
import { ComplaintTimeline } from "@/components/complaints/complaint-timeline";
import { PriorityBadge } from "@/components/priority-badge";
import { StatusBadge } from "@/components/status-badge";
import {
  complaintCategoryLabels,
  formatComplaintReference,
} from "@/lib/complaints/constants";
import { getComplaintById } from "@/lib/complaints/queries";
import { requireResident } from "@/lib/auth/session";

type ComplaintDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ComplaintDetailPage({ params }: ComplaintDetailPageProps) {
  const { id } = await params;
  const profile = await requireResident();
  const complaint = await getComplaintById(id);

  if (!complaint || complaint.created_by !== profile.id) {
    notFound();
  }

  return (
    <>
      <Link
        href="/complaints"
        className="mb-lg inline-flex items-center gap-sm text-label-md text-on-surface-variant hover:text-primary md:hidden"
      >
        <ChevronLeft className="size-4" />
        Back to complaints
      </Link>

      <div className="lg:grid lg:grid-cols-12 lg:gap-gutter">
        <div className="space-y-lg lg:col-span-8">
          <section className="rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-lg">
            <div className="mb-md flex flex-col justify-between gap-md md:flex-row md:items-start">
              <div className="space-y-sm">
                <span className="text-label-md uppercase tracking-wider text-primary">
                  Complaint {formatComplaintReference(complaint.reference_code)}
                </span>
                <h2 className="text-headline-md-mobile font-bold text-on-surface md:text-headline-md">
                  {complaint.title}
                </h2>
                <div className="flex flex-wrap gap-sm pt-base">
                  <span className="flex items-center gap-1 rounded-full bg-surface-container-high px-3 py-1 text-label-sm text-on-surface-variant">
                    <Tags className="size-3.5" />
                    {complaintCategoryLabels[complaint.category]}
                  </span>
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                </div>
              </div>
            </div>
            <p className="text-body-md leading-relaxed text-on-surface-variant">
              {complaint.description}
            </p>
          </section>

          {complaint.attachments.length > 0 ? (
            <section>
              <h3 className="mb-md px-base text-headline-sm font-semibold text-on-surface">
                Reference Images
              </h3>
              <div className="grid grid-cols-2 gap-md md:grid-cols-4">
                {complaint.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="relative aspect-square overflow-hidden rounded-lg border border-outline-variant"
                  >
                    <ComplaintImage
                      path={attachment.file_url}
                      alt={attachment.file_name ?? "Attachment"}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <ComplaintTimeline history={complaint.status_history} />
        </div>

        <aside className="mt-xl lg:col-span-4 lg:mt-0">
          <ComplaintCommentThread
            complaintId={complaint.id}
            comments={complaint.comments}
            currentUserId={profile.id}
          />
        </aside>
      </div>
    </>
  );
}
