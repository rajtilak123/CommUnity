import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ComplaintCommentThread } from "@/components/complaints/complaint-comment-thread";
import { ComplaintImage } from "@/components/complaints/complaint-image";
import { ComplaintStatusSelect } from "@/components/complaints/complaint-status-select";
import { PriorityBadge } from "@/components/priority-badge";
import {
  complaintCategoryLabels,
  formatComplaintDateTime,
  formatComplaintReference,
} from "@/lib/complaints/constants";
import { getComplaintById } from "@/lib/complaints/queries";
import { getProfileInitials } from "@/lib/auth/profile-utils";
import { requireAdmin } from "@/lib/auth/session";

type AdminComplaintDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminComplaintDetailPage({ params }: AdminComplaintDetailPageProps) {
  const { id } = await params;
  const profile = await requireAdmin();
  const complaint = await getComplaintById(id, { includeInternalComments: true });

  if (!complaint) {
    notFound();
  }

  const author = complaint.author;
  const initials = getProfileInitials({ full_name: author?.full_name ?? null });

  return (
    <div className="grid w-full grid-cols-12 gap-gutter">
      <div className="col-span-12 flex flex-col gap-lg lg:col-span-7">
        <section className="rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-lg">
          <div className="mb-md flex items-start justify-between">
            <div className="flex items-center gap-md">
              <div className="flex size-16 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-high text-headline-sm font-bold text-primary">
                {initials}
              </div>
              <div>
                <h2 className="text-headline-sm text-on-surface">{author?.full_name ?? "Resident"}</h2>
                <p className="text-body-md text-on-surface-variant">
                  {author?.unit_label ? `Unit ${author.unit_label}` : "Resident"}
                </p>
              </div>
            </div>
            <Link
              href="/profile"
              className="rounded-lg border border-outline px-md py-sm text-label-md text-primary transition-colors hover:bg-surface-container-low"
            >
              View Profile
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-md border-t border-outline-variant pt-md">
            <div>
              <p className="mb-xs text-label-sm uppercase text-outline">Contact Number</p>
              <p className="text-body-md text-on-surface">{author?.phone ?? "—"}</p>
            </div>
            <div>
              <p className="mb-xs text-label-sm uppercase text-outline">Email Address</p>
              <p className="break-all text-body-md text-on-surface">{author?.email ?? "—"}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-lg">
          <div className="mb-md flex items-center justify-between">
            <h3 className="text-headline-sm text-on-surface">{complaint.title}</h3>
            <span className="rounded-full bg-surface-variant px-3 py-1 text-label-sm text-primary">
              {complaintCategoryLabels[complaint.category]}
            </span>
          </div>
          <p className="mb-lg text-body-lg text-on-surface-variant">{complaint.description}</p>
          <div className="grid grid-cols-3 gap-md">
            {complaint.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="relative aspect-square overflow-hidden rounded-lg border border-outline-variant"
              >
                <ComplaintImage
                  path={attachment.file_url}
                  alt={attachment.file_name ?? "Evidence"}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </section>

        <ComplaintCommentThread
          complaintId={complaint.id}
          comments={complaint.comments}
          currentUserId={profile.id}
          isAdmin
          className="h-auto min-h-[400px]"
        />
      </div>

      <div className="col-span-12 flex flex-col gap-lg lg:col-span-5">
        <section className="sticky top-24 rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-lg">
          <div className="mb-md flex items-center gap-sm text-label-md text-on-surface-variant">
            <Link href="/admin/complaints" className="hover:text-primary">
              Complaints
            </Link>
            <ChevronRight className="size-4 text-outline" />
            <span className="font-bold text-on-surface">
              {formatComplaintReference(complaint.reference_code)}
            </span>
          </div>

          <div className="mb-md">
            <PriorityBadge priority={complaint.priority} />
          </div>

          <h4 className="mb-md text-label-sm uppercase text-outline">Complaint Status</h4>
          <ComplaintStatusSelect complaintId={complaint.id} currentStatus={complaint.status} />

          <div className="mt-2xl">
            <h4 className="mb-lg text-label-sm uppercase text-outline">Activity Timeline</h4>
            <div className="relative ml-3 flex flex-col gap-lg">
              <div className="absolute bottom-2 left-[7px] top-2 w-0.5 bg-outline-variant" />
              {complaint.status_history
                .slice()
                .reverse()
                .map((entry) => (
                  <div key={entry.id} className="relative flex items-start gap-md">
                    <div className="relative z-10 mt-1 size-4 rounded-full border-4 border-surface-container-lowest bg-primary shadow-sm" />
                    <div className="flex-1">
                      <p className="text-label-md font-bold text-on-surface">
                        Status changed to &apos;{entry.new_status.replace("_", " ")}&apos;
                      </p>
                      <p className="text-body-md text-on-surface-variant">
                        {formatComplaintDateTime(entry.created_at)}
                      </p>
                      {entry.note ? (
                        <p className="text-body-md text-on-surface-variant">{entry.note}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-2xl border-t border-outline-variant pt-lg">
            <div className="flex flex-col gap-md">
              <div className="flex justify-between">
                <span className="text-label-md text-outline">Submission Date</span>
                <span className="text-label-md text-on-surface">
                  {formatComplaintDateTime(complaint.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-label-md text-outline">Category</span>
                <span className="text-label-md text-on-surface">
                  {complaintCategoryLabels[complaint.category]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-label-md text-outline">Last Updated</span>
                <span className="text-label-md text-on-surface">
                  {formatComplaintDateTime(complaint.updated_at)}
                </span>
              </div>
              {complaint.assigned_to ? (
                <div className="flex justify-between">
                  <span className="text-label-md text-outline">Assigned To</span>
                  <span className="text-label-md text-on-surface">
                    {complaint.assignee?.full_name ?? complaint.assigned_to}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
