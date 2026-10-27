import type { Metadata } from "next";
import { ProfileForm } from "@/components/admin/account/profile-form";
import { isSuper } from "@/lib/perm";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Thông tin tài khoản" };

export default async function ProfilePage() {
  const admin = await requireAdmin();
  return (
    <ProfileForm
      profile={{
        username: admin.username ?? "",
        fullname: admin.fullname ?? "",
        email: admin.email ?? "",
        phone: admin.phone ?? "",
        image: admin.image ?? "",
        role: admin.role ?? "",
        isSuper: isSuper(admin),
      }}
    />
  );
}
