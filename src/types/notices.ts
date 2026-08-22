import type { Profile } from "@/types/auth";

export const noticeCategories = [
  "general",
  "maintenance",
  "event",
  "billing",
  "security",
  "other",
] as const;

export type NoticeCategory = (typeof noticeCategories)[number];

export const noticePriorities = ["low", "medium", "high", "urgent"] as const;
export type NoticePriority = (typeof noticePriorities)[number];

export const noticeStatuses = ["draft", "published", "archived"] as const;
export type NoticeStatus = (typeof noticeStatuses)[number];

export type Notice = {
  id: string;
  society_id: string;
  created_by: string;
  title: string;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  status: NoticeStatus;
  is_pinned: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NoticeAttachment = {
  id: string;
  notice_id: string;
  file_url: string;
  file_name: string | null;
  created_at: string;
};

export type NoticeRead = {
  notice_id: string;
  profile_id: string;
  read_at: string;
};

export type NoticeWithRelations = Notice & {
  attachments: NoticeAttachment[];
  reads: NoticeRead[];
  author?: Pick<Profile, "id" | "full_name" | "email" | "unit_label" | "avatar_url" | "role">;
  is_read?: boolean;
};

export type NoticeListItem = Notice & {
  attachments: NoticeAttachment[];
  author?: Pick<Profile, "id" | "full_name" | "unit_label" | "avatar_url">;
  is_read?: boolean;
};

export type NoticeStats = {
  published: number;
  drafts: number;
  archived: number;
  unread: number;
};
