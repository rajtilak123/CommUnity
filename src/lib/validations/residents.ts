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
