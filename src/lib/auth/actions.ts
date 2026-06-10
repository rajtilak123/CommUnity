"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getHomePathForRole } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, updateProfileSchema } from "@/lib/validations/auth";

export type AuthActionState = {
  error?: string;
  success?: string;
};

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid credentials" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", data.user.id)
  .single();

console.log("USER ID:", data.user.id);
console.log("PROFILE:", profile);
console.log("PROFILE ERROR:", profileError);

if (profileError || !profile) {
  await supabase.auth.signOut();
  return { error: "Profile not found. Contact your administrator." };
}

  revalidatePath("/", "layout");
  redirect(getHomePathForRole(profile.role));
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function updateProfileAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = updateProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors.full_name?.[0] ?? "Invalid profile data",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: "Profile updated successfully." };
}
