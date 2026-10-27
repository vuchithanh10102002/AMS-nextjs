import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LangAddForm } from "@/components/admin/lang/lang-forms";
import { can } from "@/lib/perm";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Thêm khoá giao diện" };

export default async function LangAddPage() {
  const admin = await requireAdmin();
  if (!can(admin, "lang", "add")) redirect("/admin?denied=1");
  return <LangAddForm />;
}
