import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/auth";

export async function getResidentsList(societyId: string): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("society_id", societyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data as Profile[];
}

export async function getResidentById(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }
  return data as Profile;
}

export async function getSocietyById(id: string): Promise<{ id: string; name: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("societies")
    .select("id, name")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }
  return data;
}

