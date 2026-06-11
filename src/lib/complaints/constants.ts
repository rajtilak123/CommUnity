import type { ComplaintCategory } from "@/types/complaints";
import type { ComplaintPriority, ComplaintStatus } from "@/types/ui";

export const complaintCategoryLabels: Record<ComplaintCategory, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  security: "Security",
  housekeeping: "Housekeeping",
  parking: "Parking",
  maintenance: "Maintenance",
  noise: "Noise",
  amenities: "Amenities",
  other: "Other",
};

export const complaintStatusLabels: Record<ComplaintStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const complaintPriorityLabels: Record<ComplaintPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const complaintStatusFilterOptions: Array<{ value: "all" | ComplaintStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export function formatComplaintReference(referenceCode: string): string {
  return referenceCode.startsWith("#") ? referenceCode : `#${referenceCode}`;
}

export function formatComplaintDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatComplaintDateTime(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}
