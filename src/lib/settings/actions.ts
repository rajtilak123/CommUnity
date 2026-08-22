"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import {
  createInvitationSchema,
  updateAdminProfileSchema,
  updateSocietySchema,
} from "@/lib/validations/settings";

export type SettingsActionState = {
  error?: string;
  success?: string;
  token?: string;
};

export async function createInvitationAction(
  email: string,
  type: "resident_onboard" | "admin_bootstrap"
): Promise<SettingsActionState> {
  try {
    const profile = await requireAdmin();
    const supabase = await createClient();

    const parsed = createInvitationSchema.safeParse({ email, type });
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors.email?.[0] || "Invalid inputs" };
    }

    // Generate secure random plaintext token
    const token = "invite_" + crypto.randomBytes(16).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // 7 Days Expiry
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from("invitations")
      .insert({
        society_id: profile.society_id,
        email: email.toLowerCase().trim(),
        type: type,
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_by: profile.id,
      });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/settings");
    return {
      success: `Invitation created successfully for ${email}. Please copy the token now.`,
      token: token,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function createResidentInvitationAction(email: string): Promise<SettingsActionState> {
  return createInvitationAction(email, "resident_onboard");
}

export async function createAdminInvitationAction(email: string): Promise<SettingsActionState> {
  return createInvitationAction(email, "admin_bootstrap");
}

export async function revokeInvitationAction(id: string): Promise<SettingsActionState> {
  try {
    const profile = await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("id", id)
      .eq("society_id", profile.society_id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/settings");
    return { success: "Invitation revoked successfully." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateAdminProfileAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    const profile = await requireAdmin();
    const supabase = await createClient();

    const parsed = updateAdminProfileSchema.safeParse({
      full_name: formData.get("full_name"),
      phone: formData.get("phone"),
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors.full_name?.[0] || "Invalid profile details" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        phone: parsed.data.phone || null,
      })
      .eq("id", profile.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/settings");
    return { success: "Admin profile updated successfully." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateSocietyAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    const profile = await requireAdmin();
    const supabase = await createClient();

    const parsed = updateSocietySchema.safeParse({
      name: formData.get("name"),
      address: formData.get("address"),
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors.name?.[0] || "Invalid society details" };
    }

    const { error } = await supabase
      .from("societies")
      .update({
        name: parsed.data.name,
        address: parsed.data.address,
      })
      .eq("id", profile.society_id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin/dashboard");
    return { success: "Society details updated successfully." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
