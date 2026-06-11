import { z } from "zod";

import { complaintCategories } from "@/types/complaints";
import { complaintPriorities, complaintStatuses } from "@/types/ui";

export const createComplaintSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  category: z.enum(complaintCategories),
  priority: z.enum(complaintPriorities),
});

export const addCommentSchema = z.object({
  complaintId: z.string().uuid(),
  content: z.string().trim().min(1, "Comment cannot be empty"),
  isInternal: z.boolean().optional().default(false),
});

export const updateComplaintStatusSchema = z.object({
  complaintId: z.string().uuid(),
  status: z.enum(complaintStatuses),
  note: z.string().trim().optional(),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>;
