export { loginSchema, updateProfileSchema } from "@/lib/validations/auth";
export type { LoginInput, UpdateProfileInput } from "@/lib/validations/auth";
export {
  addCommentSchema,
  createComplaintSchema,
  updateComplaintStatusSchema,
} from "@/lib/validations/complaints";
export type {
  AddCommentInput,
  CreateComplaintInput,
  UpdateComplaintStatusInput,
} from "@/lib/validations/complaints";

export { createNoticeSchema, updateNoticeSchema } from "@/lib/validations/notices";
export type { CreateNoticeInput, UpdateNoticeInput } from "@/lib/validations/notices";

export {
  updateResidentStatusSchema,
  toggleResidentActiveSchema,
  updateResidentRoleSchema,
} from "@/lib/validations/residents";
export type {
  UpdateResidentStatusInput,
  ToggleResidentActiveInput,
  UpdateResidentRoleInput,
} from "@/lib/validations/residents";

