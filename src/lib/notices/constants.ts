import type { NoticeCategory, NoticePriority, NoticeStatus } from "@/types/notices";

export const noticeCategoryLabels: Record<NoticeCategory, string> = {
  general: "General",
  maintenance: "Maintenance",
  event: "Event",
  billing: "Billing",
  security: "Security",
  other: "Other",
};

export const noticeStatusLabels: Record<NoticeStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const noticePriorityLabels: Record<NoticePriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const noticeStatusFilterOptions: Array<{ value: "all" | NoticeStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export function formatNoticeDate(date: string | null): string {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatNoticeDateTime(date: string | null): string {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}
