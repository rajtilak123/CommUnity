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
  joinCodeSchema,
  joinRegisterSchema,
} from "@/lib/validations/residents";
export type {
  UpdateResidentStatusInput,
  ToggleResidentActiveInput,
  UpdateResidentRoleInput,
  JoinCodeInput,
  JoinRegisterInput,
} from "@/lib/validations/residents";


