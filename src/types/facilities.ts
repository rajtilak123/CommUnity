import type { Profile } from "@/types/auth";

export const bookingStatuses = ["pending", "approved", "rejected", "cancelled", "completed"] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

export type Facility = {
  id: string;
  society_id: string;
  name: string;
  description: string;
  rules: string | null;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type FacilityImage = {
  id: string;
  facility_id: string;
  file_url: string;
  file_name: string | null;
  created_at: string;
};

export type FacilityBooking = {
  id: string;
  facility_id: string;
  profile_id: string;
  society_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string | null;
  admin_notes: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
};

export type FacilityBlockedDate = {
  id: string;
  facility_id: string;
  start_time: string;
  end_time: string;
  reason: string;
  created_by: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
};

export type FacilityListItem = Facility & {
  images: FacilityImage[];
};

export type FacilityWithRelations = Facility & {
  images: FacilityImage[];
  bookings: FacilityBooking[];
  blocked_dates: FacilityBlockedDate[];
};

export type BookingListItem = FacilityBooking & {
  facility?: Pick<Facility, "id" | "name">;
  resident?: Pick<Profile, "id" | "full_name" | "unit_label">;
};

export type BookingWithRelations = FacilityBooking & {
  facility: Facility & { images: FacilityImage[] };
  resident: Profile;
  approver?: Profile | null;
};
