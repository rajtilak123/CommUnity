import { z } from "zod";

export const createFacilitySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  rules: z.string().trim().optional().nullable(),
  is_active: z.coerce.boolean().optional().default(true),
});

export const updateFacilitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  rules: z.string().trim().optional().nullable(),
  is_active: z.coerce.boolean().optional().default(true),
});

export const bookingSchema = z.object({
  facility_id: z.string().uuid(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  notes: z.string().trim().optional().nullable(),
}).refine((data) => {
  const start = new Date(data.start_time);
  const end = new Date(data.end_time);
  return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start;
}, {
  message: "End time must be after start time",
  path: ["end_time"],
});

export const blockDatesSchema = z.object({
  facility_id: z.string().uuid(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  reason: z.string().trim().min(3, "Reason must be at least 3 characters"),
}).refine((data) => {
  const start = new Date(data.start_time);
  const end = new Date(data.end_time);
  return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start;
}, {
  message: "End time must be after start time",
  path: ["end_time"],
});

export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type BlockDatesInput = z.infer<typeof blockDatesSchema>;
