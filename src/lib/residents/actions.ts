"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  updateResidentStatusSchema,
  toggleResidentActiveSchema,
  updateResidentRoleSchema,
  updateUnitLabelSchema,
} from "@/lib/validations/residents";

export async function updateResidentStatusAction(
  residentId: string,
  status: "approved" | "rejected",
  unitLabel?: string | null
) {
  const admin = await requireAdmin();

  // Validate inputs
  const parsed = updateResidentStatusSchema.safeParse({ status, unit_label: unitLabel });
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors.unit_label?.[0] || "Invalid input parameters",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      status,
      unit_label: status === "approved" ? parsed.data.unit_label : null,
    })
    .eq("id", residentId)
    .eq("society_id", admin.society_id);

  if (error) {
    return { error: error.message };
  }

  // Create notification log
  const title = status === "approved" ? "Account Approved" : "Account Rejected";
  const message = status === "approved"
    ? "Your resident account has been approved. You can now access CommUnity."
    : "Your registration request has been rejected. Please contact your society administrator.";

  await supabase
    .from("notifications")
    .insert({
      user_id: residentId,
      title,
      message,
      type: "account",
      link_url: status === "approved" ? "/" : null,
    });

  revalidatePath("/admin/residents");
  revalidatePath(`/admin/residents/${residentId}`);
  return { success: `Resident successfully ${status}` };
}

export async function toggleResidentActiveAction(residentId: string, isActive: boolean) {
  const admin = await requireAdmin();

  // Validate inputs
  const parsed = toggleResidentActiveSchema.safeParse({ is_active: isActive });
  if (!parsed.success) {
    return { error: "Invalid active status value" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: parsed.data.is_active })
    .eq("id", residentId)
    .eq("society_id", admin.society_id);

  if (error) {
    return { error: error.message };
  }

  // Create notification log
  const title = isActive ? "Account Activated" : "Account Suspended";
  const message = isActive
    ? "Your resident account has been activated. You can now access CommUnity."
    : "Your account has been deactivated. Please contact your society administrator.";

  await supabase
    .from("notifications")
    .insert({
      user_id: residentId,
      title,
      message,
      type: "account",
      link_url: isActive ? "/" : null,
    });

  revalidatePath("/admin/residents");
  revalidatePath(`/admin/residents/${residentId}`);
  return { success: `Resident account ${isActive ? "activated" : "deactivated"}` };
}

export async function updateResidentRoleAction(residentId: string, role: "resident" | "admin") {
  const admin = await requireAdmin();

  // Validate inputs
  const parsed = updateResidentRoleSchema.safeParse({ role });
  if (!parsed.success) {
    return { error: "Invalid role value" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", residentId)
    .eq("society_id", admin.society_id);

  if (error) {
    return { error: error.message };
  }

  // Create notification log
  const title = "Role Updated";
  const message = `Your account role has been updated to ${role}.`;

  await supabase
    .from("notifications")
    .insert({
      user_id: residentId,
      title,
      message,
      type: "account",
      link_url: "/",
    });

  revalidatePath("/admin/residents");
  revalidatePath(`/admin/residents/${residentId}`);
  return { success: `Resident role updated to ${role}` };
}

export async function updateUnitLabelAction(residentId: string, unitLabel: string) {
  const admin = await requireAdmin();

  const parsed = updateUnitLabelSchema.safeParse({ unit_label: unitLabel });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.unit_label?.[0] || "Invalid unit label" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ unit_label: parsed.data.unit_label })
    .eq("id", residentId)
    .eq("society_id", admin.society_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/residents");
  revalidatePath(`/admin/residents/${residentId}`);
  return { success: "Unit designation updated" };
}
