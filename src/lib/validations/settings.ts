import { z } from "zod";

export const updateAdminProfileSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;

export const createInvitationSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  type: z.enum(["admin_bootstrap", "resident_onboard"]),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export const updateSocietySchema = z.object({
  name: z.string().trim().min(1, "Society name is required").max(150),
  address: z.string().trim().min(1, "Address is required").max(300),
});

export type UpdateSocietyInput = z.infer<typeof updateSocietySchema>;
