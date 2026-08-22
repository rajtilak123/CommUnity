import { z } from "zod";

import { noticeCategories, noticePriorities, noticeStatuses } from "@/types/notices";

export const createNoticeSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  content: z.string().trim().min(10, "Content must be at least 10 characters"),
  category: z.enum(noticeCategories),
  priority: z.enum(noticePriorities),
  status: z.enum(noticeStatuses),
  is_pinned: z.boolean().optional().default(false),
  published_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
}).refine((data) => {
  if (data.expires_at && data.published_at) {
    return new Date(data.expires_at) > new Date(data.published_at);
  }
  return true;
}, {
  message: "Expiration date must be after publication date",
  path: ["expires_at"],
});

export const updateNoticeSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  content: z.string().trim().min(10, "Content must be at least 10 characters"),
  category: z.enum(noticeCategories),
  priority: z.enum(noticePriorities),
  status: z.enum(noticeStatuses),
  is_pinned: z.boolean().optional().default(false),
  published_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
}).refine((data) => {
  if (data.expires_at && data.published_at) {
    return new Date(data.expires_at) > new Date(data.published_at);
  }
  return true;
}, {
  message: "Expiration date must be after publication date",
  path: ["expires_at"],
});

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;
export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;
