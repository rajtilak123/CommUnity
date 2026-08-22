"use client";

import Link from "next/link";
import { Edit, Trash2, Pin, PinOff } from "lucide-react";
import { useTransition } from "react";

import { PriorityBadge } from "@/components/priority-badge";
import { NoticeStatusBadge } from "@/components/notices/notice-status-badge";
import {
  noticeCategoryLabels,
  formatNoticeDate,
} from "@/lib/notices/constants";
import { deleteNoticeAction, togglePinNoticeAction } from "@/lib/notices/actions";
import type { NoticeListItem } from "@/types/notices";
import { cn } from "@/lib/utils";

type NoticeTableProps = {
  notices: NoticeListItem[];
  className?: string;
};

export function NoticeTable({ notices, className }: NoticeTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleTogglePin = (id: string) => {
    startTransition(async () => {
      const res = await togglePinNoticeAction(id);
      if (res.error) {
        alert(res.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this notice? This action cannot be undone.")) {
      startTransition(async () => {
        const res = await deleteNoticeAction(id);
        if (res.error) {
          alert(res.error);
        }
      });
    }
  };

  return (
    <div className={cn("overflow-hidden rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant w-8">
                {/* Pin column */}
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Title &amp; Category
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Priority
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Status
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Publish Date
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Expiry Date
              </th>
              <th className="px-md py-4 text-right text-label-md uppercase tracking-wider text-on-surface-variant">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {notices.map((notice) => {
              return (
                <tr key={notice.id} className="group transition-colors hover:bg-surface-container-high">
                  <td className="px-md py-4">
                    {notice.is_pinned ? (
                      <span title="Pinned Notice">
                        <Pin className="size-4 rotate-45 text-primary fill-current" />
                      </span>
                    ) : null}
                  </td>
                  <td className="px-md py-4">
                    <p className="text-body-md font-medium text-on-surface">{notice.title}</p>
                    <p className="mt-1 inline-block rounded-full bg-surface-container px-2 py-0.5 text-[11px] text-on-surface-variant capitalize">
                      {noticeCategoryLabels[notice.category]}
                    </p>
                  </td>
                  <td className="px-md py-4">
                    <PriorityBadge priority={notice.priority} />
                  </td>
                  <td className="px-md py-4">
                    <NoticeStatusBadge status={notice.status} />
                  </td>
                  <td className="px-md py-4 text-body-md text-on-surface-variant">
                    {formatNoticeDate(notice.published_at)}
                  </td>
                  <td className="px-md py-4 text-body-md text-on-surface-variant">
                    {formatNoticeDate(notice.expires_at)}
                  </td>
                  <td className="px-md py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(notice.id)}
                        disabled={isPending}
                        className={cn(
                          "rounded-lg p-2 transition-colors cursor-pointer",
                          notice.is_pinned 
                            ? "text-primary hover:bg-primary/10" 
                            : "text-on-surface-variant hover:bg-surface-container-high"
                        )}
                        title={notice.is_pinned ? "Unpin Notice" : "Pin Notice"}
                      >
                        {notice.is_pinned ? <PinOff className="size-5" /> : <Pin className="size-5 rotate-45" />}
                      </button>
                      
                      <Link
                        href={`/admin/notices/${notice.id}`}
                        className="rounded-lg p-2 text-secondary transition-colors hover:bg-secondary-container cursor-pointer"
                        title="Edit Notice"
                      >
                        <Edit className="size-5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(notice.id)}
                        disabled={isPending}
                        className="rounded-lg p-2 text-error transition-colors hover:bg-error-container cursor-pointer"
                        title="Delete Notice"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
