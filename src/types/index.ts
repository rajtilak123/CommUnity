export type { Profile, UserRole } from "@/types/auth";
export { userRoles } from "@/types/auth";
export type { ComplaintPriority, ComplaintStatus } from "@/types/ui";
export { complaintPriorities, complaintStatuses } from "@/types/ui";
export type {
  Complaint,
  ComplaintAttachment,
  ComplaintCategory,
  ComplaintComment,
  ComplaintListItem,
  ComplaintStats,
  ComplaintStatusHistory,
  ComplaintWithRelations,
} from "@/types/complaints";
export { complaintCategories } from "@/types/complaints";

export type {
  Notice,
  NoticeAttachment,
  NoticeCategory,
  NoticeListItem,
  NoticePriority,
  NoticeRead,
  NoticeStats,
  NoticeStatus,
  NoticeWithRelations,
} from "@/types/notices";
export { noticeCategories, noticePriorities, noticeStatuses } from "@/types/notices";
