import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminHomePage() {
  await requireAdmin();
  redirect("/admin/dashboard");
}
