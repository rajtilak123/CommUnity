import type { BookingStatus } from "@/types/facilities";

export const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  completed: "Completed",
};

export const bookingStatusColors: Record<BookingStatus, string> = {
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  rejected: "bg-error/10 text-error border-error/20",
  cancelled: "bg-outline-variant/10 text-on-surface-variant border-outline-variant/20",
  completed: "bg-primary/10 text-primary border-primary/20",
};

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    dateStyle: "medium",
  });
}

export const DEFAULT_FACILITY_IMAGES: Record<string, string> = {
  "community hall": "/facilities/community-hall.jpg",
  "gym": "/facilities/gym.jpg",
  "tennis court": "/facilities/tennis-court.jpg",
};

export function getDefaultFacilityImage(facilityName?: string | null): string | null {
  if (!facilityName) return null;
  const nameLower = facilityName.trim().toLowerCase();
  for (const [key, value] of Object.entries(DEFAULT_FACILITY_IMAGES)) {
    if (nameLower.includes(key)) {
      return value;
    }
  }
  return null;
}
