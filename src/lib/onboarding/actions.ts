"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { getRawProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type OnboardingActionState = {
  error?: string;
  success?: string;
};

export async function claimResidentInviteAction(
  _prevState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const token = formData.get("token") as string;
  if (!token || typeof token !== "string") {
    return { error: "Invitation token is required" };
  }

  // 1. Authenticated session check
  const profile = await getRawProfile();
  if (!profile) {
    return { error: "You must be logged in to claim an invitation" };
  }

  const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");
  const supabase = await createClient();

  // 2. Query invitation using token hash
  const { data: invitation, error: inviteError } = await supabase
    .from("invitations")
    .select("*")
    .eq("token_hash", tokenHash)
    .single();

  if (inviteError || !invitation) {
    return { error: "Invalid invitation code" };
  }

  // 3. Expiration check
  if (new Date(invitation.expires_at) < new Date()) {
    return { error: "This invitation code has expired" };
  }

  // 4. Redeemed check
  if (invitation.is_redeemed) {
    return { error: "This invitation code has already been redeemed" };
  }

  // 5. Type check
  if (invitation.type !== "resident_onboard") {
    return { error: "This code is not valid for resident registration" };
  }

  // 6. Email mismatch check
  if (invitation.email.toLowerCase() !== profile.email.toLowerCase()) {
    return { error: "This invitation code was issued to a different email address" };
  }

  // 7. Update invitation status
  const { error: updateInviteError } = await supabase
    .from("invitations")
    .update({
      is_redeemed: true,
      redeemed_by: profile.id,
      redeemed_at: new Date().toISOString()
    })
    .eq("id", invitation.id);

  if (updateInviteError) {
    return { error: updateInviteError.message };
  }

  // 8. Update profile record
  const { error: updateProfileError } = await supabase
    .from("profiles")
    .update({
      society_id: invitation.society_id,
      status: "pending", // Force pending
      role: "resident"   // Force resident
    })
    .eq("id", profile.id);

  if (updateProfileError) {
    return { error: updateProfileError.message };
  }

  revalidatePath("/", "layout");
  return { success: "Invitation claimed successfully! Waiting for administrator approval." };
}

export async function claimAdminBootstrapAction(
  _prevState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const token = formData.get("token") as string;
  if (!token || typeof token !== "string") {
    return { error: "Invitation token is required" };
  }

  // 1. Authenticated session check
  const profile = await getRawProfile();
  if (!profile) {
    return { error: "You must be logged in to claim an invitation" };
  }

  const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");
  const supabase = await createClient();

  // 2. Query invitation using token hash
  const { data: invitation, error: inviteError } = await supabase
    .from("invitations")
    .select("*")
    .eq("token_hash", tokenHash)
    .single();

  if (inviteError || !invitation) {
    return { error: "Invalid bootstrap code" };
  }

  // 3. Expiration check
  if (new Date(invitation.expires_at) < new Date()) {
    return { error: "This bootstrap code has expired" };
  }

  // 4. Redeemed check
  if (invitation.is_redeemed) {
    return { error: "This bootstrap code has already been redeemed" };
  }

  // 5. Type check
  if (invitation.type !== "admin_bootstrap") {
    return { error: "This code is not valid for admin bootstrap" };
  }

  // 6. Email mismatch check
  if (invitation.email.toLowerCase() !== profile.email.toLowerCase()) {
    return { error: "This bootstrap code was issued to a different email address" };
  }

  // 7. Update invitation status
  const { error: updateInviteError } = await supabase
    .from("invitations")
    .update({
      is_redeemed: true,
      redeemed_by: profile.id,
      redeemed_at: new Date().toISOString()
    })
    .eq("id", invitation.id);

  if (updateInviteError) {
    return { error: updateInviteError.message };
  }

  // 8. Update profile record (Promote to Admin & Approve)
  const { error: updateProfileError } = await supabase
    .from("profiles")
    .update({
      society_id: invitation.society_id,
      status: "approved", // Auto-approved for bootstrap admins
      role: "admin"       // Promote to admin
    })
    .eq("id", profile.id);

  if (updateProfileError) {
    return { error: updateProfileError.message };
  }

  revalidatePath("/", "layout");
  return { success: "Admin account bootstrapped successfully!" };
}
