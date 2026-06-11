import type { Profile } from "@/types/auth";
import type { ComplaintPriority, ComplaintStatus } from "@/types/ui";

export const complaintCategories = [
  "plumbing",
  "electrical",
  "security",
  "housekeeping",
  "parking",
  "maintenance",
  "noise",
  "amenities",
  "other",
] as const;

export type ComplaintCategory = (typeof complaintCategories)[number];

export type Complaint = {
  id: string;
  society_id: string;
  created_by: string;
  assigned_to: string | null;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  reference_code: string;
  created_at: string;
  updated_at: string;
};

export type ComplaintAttachment = {
  id: string;
  complaint_id: string;
  file_url: string;
  file_name: string | null;
  created_at: string;
};

export type ComplaintComment = {
  id: string;
  complaint_id: string;
  author_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
};

export type ComplaintStatusHistory = {
  id: string;
  complaint_id: string;
  old_status: ComplaintStatus | null;
  new_status: ComplaintStatus;
  changed_by: string;
  note: string | null;
  created_at: string;
};

export type ComplaintWithRelations = Complaint & {
  attachments: ComplaintAttachment[];
  comments: (ComplaintComment & { author: Pick<Profile, "id" | "full_name" | "role"> })[];
  status_history: ComplaintStatusHistory[];
  author?: Pick<Profile, "id" | "full_name" | "email" | "phone" | "unit_label" | "avatar_url">;
  assignee?: Pick<Profile, "id" | "full_name"> | null;
};

export type ComplaintListItem = Complaint & {
  attachments: ComplaintAttachment[];
  author?: Pick<Profile, "id" | "full_name" | "unit_label">;
};

export type ComplaintStats = {
  open: number;
  in_progress: number;
  resolved: number;
  high_priority: number;
};
