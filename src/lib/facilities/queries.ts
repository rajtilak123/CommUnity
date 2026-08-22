import { createClient } from "@/lib/supabase/server";
import type {
  FacilityListItem,
  FacilityWithRelations,
  BookingListItem,
  BookingWithRelations,
  FacilityBooking
} from "@/types/facilities";

// 1. Resident: view active facilities in society
export async function getResidentFacilities(societyId: string): Promise<FacilityListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("facilities")
    .select(`
      *,
      images:facility_images(*)
    `)
    .eq("society_id", societyId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as FacilityListItem[];
}

// 2. Query a facility details
export async function getFacilityById(facilityId: string): Promise<FacilityWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("facilities")
    .select(`
      *,
      images:facility_images(*),
      bookings:facility_bookings(*),
      blocked_dates:facility_blocked_dates(*)
    `)
    .eq("id", facilityId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as FacilityWithRelations;
}

// 3. Resident: view masked availability details for calendar
export async function getFacilityAvailabilityCalendar(
  facilityId: string,
  startDate?: string,
  endDate?: string
): Promise<Pick<FacilityBooking, "id" | "facility_id" | "start_time" | "end_time" | "status">[]> {
  const supabase = await createClient();
  let query = supabase
    .from("facility_availability")
    .select("id, facility_id, start_time, end_time, status")
    .eq("facility_id", facilityId);

  if (startDate) {
    query = query.gte("start_time", startDate);
  }
  if (endDate) {
    query = query.lte("end_time", endDate);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Pick<FacilityBooking, "id" | "facility_id" | "start_time" | "end_time" | "status">[];
}

// 4. Resident: view detailed personal bookings
export async function getResidentBookings(profileId: string): Promise<BookingListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("facility_bookings")
    .select(`
      *,
      facility:facilities(id, name)
    `)
    .eq("profile_id", profileId)
    .order("start_time", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as BookingListItem[];
}

// 5. Admin: view all facilities in society (active & disabled)
export async function getAdminFacilities(societyId: string): Promise<FacilityListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("facilities")
    .select(`
      *,
      images:facility_images(*)
    `)
    .eq("society_id", societyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as FacilityListItem[];
}

// 6. Admin: view bookings request manager
export async function getAdminBookings(
  societyId: string,
  status?: string | "all"
): Promise<BookingListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("facility_bookings")
    .select(`
      *,
      facility:facilities(id, name),
      resident:profiles!profile_id(id, full_name, unit_label)
    `)
    .eq("society_id", societyId)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as BookingListItem[];
}

// 7. Admin/Resident: view detailed single booking information
export async function getBookingById(bookingId: string): Promise<BookingWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("facility_bookings")
    .select(`
      *,
      facility:facilities(*, images:facility_images(*)),
      resident:profiles!profile_id(*),
      approver:profiles!approved_by(*)
    `)
    .eq("id", bookingId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as BookingWithRelations;
}
