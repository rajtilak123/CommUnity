"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin, requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  createFacilitySchema,
  updateFacilitySchema,
  bookingSchema,
  blockDatesSchema
} from "@/lib/validations/facilities";
export type FacilityActionState = {
  error?: string;
  success?: string;
};

// 1. Admin: Create Facility
export async function createFacilityAction(
  _prevState: FacilityActionState,
  formData: FormData
): Promise<FacilityActionState> {
  const profile = await requireAdmin();

  const parsed = createFacilitySchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    description: formData.get("description"),
    capacity: formData.get("capacity"),
    rules: formData.get("rules") || null,
    is_active: formData.get("is_active") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const societyId = profile.society_id;
  if (!societyId) {
    return { error: "No society configured for user profile" };
  }

  const facilityId = parsed.data.id || crypto.randomUUID();
  const supabase = await createClient();

  const { error } = await supabase
    .from("facilities")
    .insert({
      id: facilityId,
      society_id: societyId,
      name: parsed.data.name,
      description: parsed.data.description,
      capacity: parsed.data.capacity,
      rules: parsed.data.rules,
      is_active: parsed.data.is_active,
    });

  if (error) {
    return { error: error.message };
  }

  // Handle images
  const imageUrls = formData.getAll("image_urls").filter(Boolean) as string[];
  const imageNames = formData.getAll("image_names").filter(Boolean) as string[];

  if (imageUrls.length > 0) {
    const rows = imageUrls.map((url, index) => ({
      facility_id: facilityId,
      file_url: url,
      file_name: imageNames[index] ?? null,
    }));

    const { error: imageError } = await supabase
      .from("facility_images")
      .insert(rows);

    if (imageError) {
      return { error: `Facility created, but images failed: ${imageError.message}` };
    }
  }

  revalidatePath("/admin/facilities");
  revalidatePath("/facilities");

  redirect("/admin/facilities");
}

// 2. Admin: Update Facility
export async function updateFacilityAction(
  _prevState: FacilityActionState,
  formData: FormData
): Promise<FacilityActionState> {
  const profile = await requireAdmin();

  const parsed = updateFacilitySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description"),
    capacity: formData.get("capacity"),
    rules: formData.get("rules") || null,
    is_active: formData.get("is_active") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const supabase = await createClient();

  // Validate ownership
  const { data: existing, error: fetchError } = await supabase
    .from("facilities")
    .select("society_id")
    .eq("id", parsed.data.id)
    .single();

  if (fetchError || !existing) {
    return { error: "Facility not found" };
  }

  if (existing.society_id !== profile.society_id) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("facilities")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      capacity: parsed.data.capacity,
      rules: parsed.data.rules,
      is_active: parsed.data.is_active,
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  // Handle images replacement
  const imageUrls = formData.getAll("image_urls").filter(Boolean) as string[];
  const imageNames = formData.getAll("image_names").filter(Boolean) as string[];

  // Delete current image associations
  await supabase
    .from("facility_images")
    .delete()
    .eq("facility_id", parsed.data.id);

  if (imageUrls.length > 0) {
    const rows = imageUrls.map((url, index) => ({
      facility_id: parsed.data.id,
      file_url: url,
      file_name: imageNames[index] ?? null,
    }));

    const { error: imageError } = await supabase
      .from("facility_images")
      .insert(rows);

    if (imageError) {
      return { error: `Facility updated, but images failed: ${imageError.message}` };
    }
  }

  revalidatePath("/admin/facilities");
  revalidatePath(`/admin/facilities/${parsed.data.id}`);
  revalidatePath("/facilities");
  revalidatePath(`/facilities/${parsed.data.id}`);

  redirect("/admin/facilities");
}

// 3. Resident: Submit Booking request
export async function createBookingAction(
  _prevState: FacilityActionState,
  formData: FormData
): Promise<FacilityActionState> {
  const profile = await requireProfile();

  const parsed = bookingSchema.safeParse({
    facility_id: formData.get("facility_id"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const societyId = profile.society_id;
  if (!societyId) {
    return { error: "No society configured for user profile" };
  }

  const supabase = await createClient();

  const startTimeIso = new Date(parsed.data.start_time).toISOString();
  const endTimeIso = new Date(parsed.data.end_time).toISOString();

  const { error } = await supabase
    .from("facility_bookings")
    .insert({
      facility_id: parsed.data.facility_id,
      profile_id: profile.id,
      society_id: societyId,
      start_time: startTimeIso,
      end_time: endTimeIso,
      notes: parsed.data.notes,
      status: "pending",
    });

  if (error) {
    // Catch database exclusion constraint or trigger exceptions
    return { error: error.message };
  }

  revalidatePath("/facilities");
  revalidatePath(`/facilities/${parsed.data.facility_id}`);
  revalidatePath("/facilities/bookings");

  redirect("/facilities/bookings");
}

// 4. Resident: Cancel Booking
export async function cancelBookingAction(bookingId: string): Promise<FacilityActionState> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("facility_bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("profile_id", profile.id)
    .eq("status", "pending");

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/facilities/bookings");
  return { success: "Booking cancelled successfully" };
}

// 5. Admin: Approve or Reject Booking
export async function processBookingAction(
  bookingId: string,
  status: "approved" | "rejected",
  adminNotes?: string | null
): Promise<FacilityActionState> {
  const profile = await requireAdmin();
  const supabase = await createClient();

  // Fetch the target booking details first to know who to notify
  const { data: booking, error: fetchError } = await supabase
    .from("facility_bookings")
    .select(`
      *,
      facility:facilities(name)
    `)
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return { error: "Booking not found" };
  }

  if (booking.society_id !== profile.society_id) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("facility_bookings")
    .update({
      status,
      admin_notes: adminNotes || null,
      approved_by: profile.id,
    })
    .eq("id", bookingId);

  if (error) {
    return { error: error.message };
  }

  // Create notifications log dynamically
  const formattedDate = new Date(booking.start_time).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const title = `Booking ${status === "approved" ? "Approved" : "Rejected"}`;
  const content = `Your reservation request for ${booking.facility?.name} on ${formattedDate} has been ${status}.`;

  await supabase
    .from("notifications")
    .insert({
      user_id: booking.profile_id,
      title,
      message: content,
      type: "booking",
      link_url: "/facilities/bookings",
    });

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/facilities/bookings");
  revalidatePath(`/facilities/${booking.facility_id}`);

  return { success: `Booking successfully ${status}` };
}

// 6. Admin: Block Dates
export async function blockFacilityDatesAction(
  _prevState: FacilityActionState,
  formData: FormData
): Promise<FacilityActionState> {
  const profile = await requireAdmin();

  const parsed = blockDatesSchema.safeParse({
    facility_id: formData.get("facility_id"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const supabase = await createClient();

  // Check ownership
  const { data: facility, error: fetchError } = await supabase
    .from("facilities")
    .select("society_id")
    .eq("id", parsed.data.facility_id)
    .single();

  if (fetchError || !facility) {
    return { error: "Facility not found" };
  }

  if (facility.society_id !== profile.society_id) {
    return { error: "Unauthorized" };
  }

  const startTimeIso = new Date(parsed.data.start_time).toISOString();
  const endTimeIso = new Date(parsed.data.end_time).toISOString();

  const { error } = await supabase
    .from("facility_blocked_dates")
    .insert({
      facility_id: parsed.data.facility_id,
      start_time: startTimeIso,
      end_time: endTimeIso,
      reason: parsed.data.reason,
      created_by: profile.id,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/facilities/${parsed.data.facility_id}`);
  revalidatePath(`/admin/facilities/${parsed.data.facility_id}`);

  return { success: "Date range successfully blocked" };
}
