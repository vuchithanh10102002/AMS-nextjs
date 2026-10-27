"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { exec, first } from "@/lib/db";
import { normalizeMediaPath } from "@/lib/media";
import { requireAdmin } from "@/lib/session";

export type ProfileState = { ok?: boolean; error?: string; message?: string; at?: number };

const md5 = (s: string) => createHash("md5").update(s).digest("hex");

export async function saveProfile(_: ProfileState, form: FormData): Promise<ProfileState> {
  try {
    const admin = await requireAdmin();
    const fullname = String(form.get("fullname") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const image = normalizeMediaPath(String(form.get("image") ?? ""));
    const current = String(form.get("current_password") ?? "");
    const next = String(form.get("new_password") ?? "");
    const confirm = String(form.get("confirm_password") ?? "");
    if (!fullname) throw new Error("Vui lòng nhập Họ tên");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email không hợp lệ");
    const data: Record<string, string> = { fullname: fullname.slice(0, 34), email: email.slice(0, 64), phone, image };
    if (next) {
      if (next.length < 6) throw new Error("Mật khẩu mới tối thiểu 6 ký tự");
      if (next !== confirm) throw new Error("Nhập lại mật khẩu mới không khớp");
      const row = await first<{ password: string | null }>("SELECT password FROM admins WHERE id = ?", [admin.id]);
      if (!row || row.password !== md5(current)) throw new Error("Mật khẩu hiện tại không đúng");
      data.password = md5(next);
    }
    await exec("UPDATE admins SET ? WHERE id = ?", [data, admin.id]);
    revalidatePath("/admin", "layout");
    return { ok: true, message: next ? "Đã cập nhật thông tin và mật khẩu" : "Cập nhật thành công", at: Date.now() };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Có lỗi xảy ra", at: Date.now() };
  }
}
