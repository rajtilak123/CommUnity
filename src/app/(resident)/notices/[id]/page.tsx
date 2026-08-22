import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Calendar, User, Pin } from "lucide-react";

import { PriorityBadge } from "@/components/priority-badge";
import { formatNoticeDateTime } from "@/lib/notices/constants";
import { NoticeAttachmentItem } from "@/components/notices/notice-attachment-item";
import { getNoticeById } from "@/lib/notices/queries";
import { requireResident } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { NoticeReadTracker } from "@/components/notices/notice-read-tracker";

export const dynamic = "force-dynamic";

type NoticeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NoticeDetailPage({ params }: NoticeDetailPageProps) {
  const { id } = await params;
  const profile = await requireResident();
  const notice = await getNoticeById(id, profile.id);

  if (!notice) {
    notFound();
  }

  const isExpired = notice.expires_at && new Date(notice.expires_at) <= new Date();
  const isNotPublishedYet = notice.published_at && new Date(notice.published_at) > new Date();
  const isNotPublished = notice.status !== "published";

  if (notice.society_id !== profile.society_id || isNotPublished || isNotPublishedYet || isExpired) {
    notFound();
  }

  return (
    <>
      <NoticeReadTracker noticeId={notice.id} isRead={!!notice.is_read} />
      <Link
        href="/notices"
        className="mb-lg inline-flex items-center gap-sm text-label-md text-on-surface-variant hover:text-primary"
      >
        <ChevronLeft className="size-4" />
        Back to notices
      </Link>

      <div className="max-w-4xl space-y-lg mt-md">
        <section className={cn(
          "rounded-[0.75rem] border p-lg bg-surface-container-lowest",
          notice.is_pinned ? "border-primary/30" : "border-outline-variant"
        )}>
          <div className="mb-md flex flex-col justify-between gap-md border-b border-outline-variant/60 pb-md">
            <div className="space-y-sm">
              <div className="flex flex-wrap items-center gap-xs text-label-sm font-semibold uppercase tracking-wider text-primary">
                {notice.is_pinned && (
                  <span className="flex items-center gap-0.5 text-primary font-bold">
                    <Pin className="size-3.5 rotate-45 shrink-0 fill-current" />
                    PINNED
                  </span>
                )}
                <span className="rounded bg-surface-container-high px-2 py-0.5 text-on-surface-variant font-medium lowercase first-letter:uppercase">
                  {notice.category} Notice
                </span>
                <PriorityBadge priority={notice.priority} className="scale-90 origin-left" />
              </div>
              <h2 className="text-headline-md font-bold text-on-surface leading-tight">
                {notice.title}
              </h2>
            </div>
            
            <div className="flex flex-col gap-xs text-label-md text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4 text-outline" />
                Published: {formatNoticeDateTime(notice.published_at)}
              </span>
              {notice.expires_at && (
                <span className="flex items-center gap-1.5 text-error font-semibold">
                  <Calendar className="size-4 text-error" />
                  Expires: {formatNoticeDateTime(notice.expires_at)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <User className="size-4 text-outline" />
                Posted by: {notice.author?.full_name || "Community Admin"}
              </span>
            </div>
          </div>
          
          <div className="whitespace-pre-line text-body-lg leading-relaxed text-on-surface-variant">
            {notice.content}
          </div>
        </section>

        {notice.attachments && notice.attachments.length > 0 ? (
          <section className="space-y-md">
            <h3 className="text-headline-sm font-semibold text-on-surface px-1">
              Attachments ({notice.attachments.length})
            </h3>
            <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
              {notice.attachments.map((attachment) => (
                <NoticeAttachmentItem
                  key={attachment.id}
                  fileUrl={attachment.file_url}
                  fileName={attachment.file_name}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
