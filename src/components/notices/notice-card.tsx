"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Paperclip, Pin } from "lucide-react";

import { PriorityBadge } from "@/components/priority-badge";
import { formatNoticeDate } from "@/lib/notices/constants";
import type { NoticeListItem } from "@/types/notices";
import { cn } from "@/lib/utils";

type NoticeCardProps = {
  notice: NoticeListItem;
  className?: string;
};

export function NoticeCard({ notice, className }: NoticeCardProps) {
  const href = `/notices/${notice.id}`;
  const hasAttachments = notice.attachments && notice.attachments.length > 0;

  return (
    <Link href={href} className={cn("group cursor-pointer block", className)}>
      <div className={cn(
        "relative rounded-[0.75rem] border bg-surface p-md transition-all duration-300 hover:border-primary hover:shadow-lg md:p-lg",
        notice.is_pinned 
          ? "border-primary/30 bg-primary/5 hover:bg-primary/10" 
          : "border-outline-variant hover:bg-surface-container-low"
      )}>
        {/* Unread dot indicator */}
        {!notice.is_read && (
          <div className="absolute right-3 top-3 flex h-3.5 w-3.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-error"></span>
          </div>
        )}

        <div className="flex flex-col gap-sm">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-xs text-label-md pr-8">
            {notice.is_pinned && (
              <span className="flex items-center gap-1 text-primary font-semibold">
                <Pin className="size-4 rotate-45 shrink-0 fill-current" />
                PINNED
              </span>
            )}
            <span className="rounded bg-surface-container-high px-2 py-0.5 text-on-surface-variant font-medium capitalize">
              {notice.category}
            </span>
            <PriorityBadge priority={notice.priority} className="scale-90 origin-left" />
            
            {hasAttachments && (
              <span className="flex items-center gap-0.5 text-outline">
                <Paperclip className="size-3.5" />
                {notice.attachments.length}
              </span>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-1 pr-6">
            <h3 className="text-headline-sm text-on-surface font-bold transition-colors group-hover:text-primary leading-tight">
              {notice.title}
            </h3>
            <p className="line-clamp-2 text-body-md text-on-surface-variant leading-relaxed">
              {notice.content}
            </p>
          </div>

          {/* Date & Action footer */}
          <div className="mt-2 flex items-center justify-between border-t border-outline-variant/60 pt-2">
            <span className="flex items-center gap-1.5 text-label-md text-outline">
              <Calendar className="size-4" />
              Published: {formatNoticeDate(notice.published_at)}
            </span>
            <span className="flex items-center gap-1 text-label-md font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Read More
              <ArrowRight className="size-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
