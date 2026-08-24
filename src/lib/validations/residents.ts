import { z } from "zod";

export const updateResidentStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  unit_label: z.string().trim().max(50).optional().nullable(),
}).refine((data) => {
  if (data.status === "approved") {
    return !!data.unit_label && data.unit_label.trim().length > 0;
  }
  return true;
}, {
  message: "Unit designation is required when approving a resident",
  path: ["unit_label"],
});

export type UpdateResidentStatusInput = z.infer<typeof updateResidentStatusSchema>;

export const toggleResidentActiveSchema = z.object({
  is_active: z.boolean(),
});

export type ToggleResidentActiveInput = z.infer<typeof toggleResidentActiveSchema>;

export const updateResidentRoleSchema = z.object({
  role: z.enum(["resident", "admin"]),
});

export type UpdateResidentRoleInput = z.infer<typeof updateResidentRoleSchema>;

export const updateUnitLabelSchema = z.object({
  unit_label: z.string().trim().min(1, "Unit designation cannot be empty").max(50),
});

export type UpdateUnitLabelInput = z.infer<typeof updateUnitLabelSchema>;



export const ALLOWED_INVITE_CHARS = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;

export const joinCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .transform((val) => val.toUpperCase())
    .refine((val) => val.length === 6, { message: "Invitation code must be exactly 6 characters" })
    .refine((val) => ALLOWED_INVITE_CHARS.test(val), {
      message: "Invalid invitation code format",
    }),
});

export type JoinCodeInput = z.infer<typeof joinCodeSchema>;

export const joinRegisterSchema = z
  .object({
    code: z.string().trim().toUpperCase().length(6, "Invalid code"),
    full_name: z.string().trim().min(1, "Full name is required").max(120),
    email: z.string().trim().email("Valid email address is required"),
    unit_label: z.string().trim().min(1, "Flat / Housing Unit is required").max(50),
    phone: z.string().trim().max(30).optional().or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type JoinRegisterInput = z.infer<typeof joinRegisterSchema>;

