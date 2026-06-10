export const complaintStatuses = ["open", "in_progress", "resolved", "closed"] as const;
export type ComplaintStatus = (typeof complaintStatuses)[number];

export const complaintPriorities = ["low", "medium", "high", "urgent"] as const;
export type ComplaintPriority = (typeof complaintPriorities)[number];
