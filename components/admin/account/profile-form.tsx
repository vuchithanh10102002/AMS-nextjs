"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useLoadingRouter } from "@/hooks/use-loading-router";
import { ImageInput } from "@/components/admin/fields";
import { saveProfile, type ProfileState } from "@/lib/actions/account";

type Profile = { username: string; fullname: string; email: string; phone: string; image: string; role: string; isSuper: boolean };

function Row({ label, required, children, help }: { label: string; required?: boolean; children: React.ReactNode; help?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {children}
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useLoadingRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfile, {});

  useEffect(() => {
    if (!state.at) return;
    if (state.error) toast.add({ type: "error", title: "Không lưu được", description: state.error });
    else {
      toast.add({ type: "success", title: state.message ?? "Đã lưu" });
      for (const n of ["current_password", "new_password", "confirm_password"]) {
        const el = formRef.current?.elements.namedItem(n);
        if (el instanceof HTMLInputElement) el.value = "";
      }
      router.refresh();
    }
  }, [state.at]);

  const perms = profile.role.split(",").filter(Boolean);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4 p-2 md:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-semibold">Thông tin tài khoản</h1>
        <Button type="submit" className="ml-auto" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />} Lưu
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="font-medium">Hồ sơ</h2>
          <Row label="Tên đăng nhập">
            <div className="min-h-9 rounded-lg border bg-muted/50 px-3 py-2 text-sm">{profile.username}</div>
          </Row>
          <Row label="Họ tên" required>
            <Input name="fullname" defaultValue={profile.fullname} maxLength={34} required />
          </Row>
          <Row label="Email" required help="Dùng để nhận link đặt lại mật khẩu">
            <Input name="email" type="email" defaultValue={profile.email} maxLength={64} required />
          </Row>
          <Row label="Điện thoại">
            <Input name="phone" defaultValue={profile.phone} />
          </Row>
          <Row label="Ảnh đại diện">
            <ImageInput name="image" defaultValue={profile.image} />
          </Row>
        </div>
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="font-medium">Đổi mật khẩu</h2>
          <Row label="Mật khẩu hiện tại">
            <Input name="current_password" type="password" autoComplete="current-password" />
          </Row>
          <Row label="Mật khẩu mới" help="Bỏ trống nếu không thay đổi, tối thiểu 6 ký tự">
            <Input name="new_password" type="password" autoComplete="new-password" />
          </Row>
          <Row label="Nhập lại mật khẩu mới">
            <Input name="confirm_password" type="password" autoComplete="new-password" />
          </Row>
          <h2 className="pt-2 font-medium">Quyền</h2>
          <p className="text-sm text-muted-foreground">
            {profile.isSuper ? "Quản trị cao nhất: toàn quyền." : perms.length ? `${perms.length} quyền được cấp.` : "Chưa được cấp quyền nào."}
          </p>
        </div>
      </div>
    </form>
  );
}
