import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingForm } from "@/components/admin/setting/setting-form";
import { can } from "@/lib/perm";
import { requireAdmin } from "@/lib/session";
import { loadSettingForm, THEME_GROUPS, THEME_KEYS } from "@/lib/settings-form";

export const metadata: Metadata = { title: "Cấu hình" };

export default async function SettingPage() {
  const admin = await requireAdmin();
  if (!can(admin, "setting", "list")) redirect("/admin?denied=1");
  const data = await loadSettingForm();
  return (
    <SettingForm
      groups={data.groups}
      theme={data.theme}
      themeGroups={THEME_GROUPS}
      themeKeys={THEME_KEYS}
      hasTheme={data.hasTheme}
      hasPass={data.hasPass}
      canEdit={can(admin, "setting", "edit")}
    />
  );
}
