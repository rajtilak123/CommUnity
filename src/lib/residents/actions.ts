"use server";

import crypto from "crypto";
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

const ALLOWED_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateSecureInviteCode(): string {
  const bytes = crypto.randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ALLOWED_CHARS[bytes[i] % ALLOWED_CHARS.length];
  }
  return code;
}

export type CreateInviteActionState = {
  error?: string;
  success?: boolean;
  code?: string;
};

export async function createResidentInvitationAction(
  _prevState: CreateInviteActionState,
  _formData: FormData,
): Promise<CreateInviteActionState> {
  void _prevState;
  void _formData;
  try {
    const admin = await requireAdmin();
    if (!admin.society_id) {
      console.error("[createResidentInvitationAction] Admin has no society_id:", admin.id);
      return { error: "No society associated with your admin account." };
    }

    const supabase = await createClient();

    // 1. Generate secure code & SHA-256 hash
    const code = generateSecureInviteCode();
    const normalizedCode = code.trim().toUpperCase();
    const tokenHash = crypto.createHash("sha256").update(normalizedCode).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const placeholderEmail = `invite-${tokenHash.substring(0, 12)}@community.local`;

    // 2. Store invitation record
    const { error: insertError } = await supabase.from("invitations").insert({
      society_id: admin.society_id,
      email: placeholderEmail,
      type: "resident_onboard",
      token_hash: tokenHash,
      created_by: admin.id,
      expires_at: expiresAt,
      is_redeemed: false,
    });

    if (insertError) {
      console.error("[createResidentInvitationAction] Insert error:", {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
      });
      return { error: insertError.message || "Failed to create invitation record." };
    }

    revalidatePath("/admin/residents");

    return {
      success: true,
      code: normalizedCode,
    };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: string }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }

    console.error("[createResidentInvitationAction] Unhandled Exception:", err);
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return { error: `Server error: ${msg}` };
  }
}

