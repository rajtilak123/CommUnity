"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { joinCodeSchema, joinRegisterSchema } from "@/lib/validations/residents";

export type ValidateCodeResult = {
  error?: string;
  valid?: boolean;
  code?: string;
  society_id?: string;
};

type ValidateRpcResponse = {
  valid: boolean;
  error?: string;
  society_id?: string;
  invitation_id?: string;
};

type CompleteSignupRpcResponse = {
  success: boolean;
  error?: string;
  society_id?: string;
  invitation_id?: string;
};

export async function validateInvitationCodeAction(code: string): Promise<ValidateCodeResult> {
  const normalizedCode = (code || "").trim().toUpperCase();
  const parsed = joinCodeSchema.safeParse({ code: normalizedCode });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.code?.[0] || "Invalid invitation code format." };
  }

  const tokenHash = crypto.createHash("sha256").update(normalizedCode).digest("hex");
  const supabase = await createClient();

  // Call the SECURITY DEFINER RPC function
  const { data, error } = await supabase.rpc("validate_invitation_code", {
    p_token_hash: tokenHash,
  });

  if (error) {
    console.error("[validateInvitationCodeAction] RPC Error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return { error: "Unable to validate invitation code. Please try again." };
  }

  const result: ValidateRpcResponse = typeof data === "string" ? JSON.parse(data) : data;

  if (!result || !result.valid) {
    return { error: result?.error || "Invalid invitation code" };
  }

  return {
    valid: true,
    code: normalizedCode,
    society_id: result.society_id,
  };
}

export type RegisterActionState = {
  error?: string;
  success?: boolean;
};

export async function registerWithInvitationAction(
  _prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const rawCode = (formData.get("code") as string) || "";
  const normalizedCode = rawCode.trim().toUpperCase();

  const parsed = joinRegisterSchema.safeParse({
    code: normalizedCode,
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    unit_label: formData.get("unit_label"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError =
      errors.code?.[0] ||
      errors.full_name?.[0] ||
      errors.email?.[0] ||
      errors.unit_label?.[0] ||
      errors.password?.[0] ||
      errors.confirm_password?.[0] ||
      "Invalid registration details.";
    return { error: firstError };
  }

  const { full_name, email, unit_label, password, phone } = parsed.data;
  const tokenHash = crypto.createHash("sha256").update(normalizedCode).digest("hex");

  const supabase = await createClient();

  // 1. Re-validate invitation code via SECURITY DEFINER RPC
  const { data: valData, error: valError } = await supabase.rpc("validate_invitation_code", {
    p_token_hash: tokenHash,
  });

  if (valError) {
    console.error("[registerWithInvitationAction] Validation RPC Error:", {
      message: valError.message,
      code: valError.code,
      details: valError.details,
      hint: valError.hint,
    });
    return { error: "Unable to validate invitation code. Please try again." };
  }

  const valResult: ValidateRpcResponse = typeof valData === "string" ? JSON.parse(valData) : valData;

  if (!valResult || !valResult.valid) {
    return { error: valResult?.error || "Invalid invitation code" };
  }

  // 2. Create user account in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  });

  if (authError || !authData.user) {
    console.error("[registerWithInvitationAction] Auth signUp Error:", authError);
    return { error: authError?.message || "Failed to create resident account." };
  }

  const userId = authData.user.id;

  // 3. Atomically upsert profile and redeem invitation via SECURITY DEFINER RPC
  const { data: signupData, error: signupError } = await supabase.rpc("complete_invitation_signup", {
    p_token_hash: tokenHash,
    p_user_id: userId,
    p_full_name: full_name,
    p_email: email,
    p_phone: phone || null,
    p_unit_label: unit_label,
  });

  if (signupError) {
    console.error("[registerWithInvitationAction] complete_invitation_signup RPC Error:", {
      message: signupError.message,
      code: signupError.code,
      details: signupError.details,
      hint: signupError.hint,
    });

    // Fallback: Direct table operations if migration has not been applied yet
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email: email.toLowerCase(),
        full_name,
        phone: phone || null,
        unit_label,
        role: "resident",
        status: "approved",
        is_active: true,
        society_id: valResult.society_id,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error("[registerWithInvitationAction] Fallback profile upsert error:", {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
      });
      return { error: `Profile error: ${profileError.message}` };
    }

    await supabase.rpc("redeem_invitation_code", {
      p_token_hash: tokenHash,
      p_user_id: userId,
    });
  } else {
    const signupResult: CompleteSignupRpcResponse =
      typeof signupData === "string" ? JSON.parse(signupData) : signupData;

    if (!signupResult?.success) {
      return { error: signupResult?.error || "Failed to complete registration." };
    }
  }

  revalidatePath("/", "layout");
  return { success: true };
}
