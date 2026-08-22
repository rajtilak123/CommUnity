export const userRoles = ["resident", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export type ProfileStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  unit_label: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: ProfileStatus;
  is_active: boolean;
  society_id: string | null;
  created_at: string;
  updated_at: string;
};

