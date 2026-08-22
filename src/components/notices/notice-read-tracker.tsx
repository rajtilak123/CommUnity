"use client";

import { useEffect } from "react";
import { markNoticeAsReadAction } from "@/lib/notices/actions";

type NoticeReadTrackerProps = {
  noticeId: string;
  isRead: boolean;
};

export function NoticeReadTracker({ noticeId, isRead }: NoticeReadTrackerProps) {
  useEffect(() => {
    if (!isRead) {
      void markNoticeAsReadAction(noticeId);
    }
  }, [noticeId, isRead]);

  return null;
}
