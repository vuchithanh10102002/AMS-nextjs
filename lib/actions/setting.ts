"use server";

import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { authorize } from "@/lib/perm";
import { normalizeMediaPath } from "@/lib/media";
import { allowedSettingNames, THEME_GROUPS, THEME_KEYS } from "@/lib/settings-form";
import { getSettings } from "@/lib/site";

export type SettingState = { ok?: boolean; error?: string; message?: string; at?: number };

export async function saveSettings(_: SettingState, form: FormData): Promise<SettingState> {
  try {
    await authorize("setting", "edit");
    const allowed = await allowedSettingNames();
    const existing = new Map(
      (await db.settings.findMany({ select: { name: true, value: true } })).map((r) => [
        r.name,
        r.value ?? "",
      ]),
    );
    for (const [name, item] of allowed) {
      const value = form.get(`s:${name}`);
      if (
        typeof value === "string" &&
        item.maxlength > 0 &&
        value.length > item.maxlength &&
        value !== existing.get(name)
      )
        throw new Error(`${item.label} tối đa ${item.maxlength} ký tự`);
    }
    for (const [name, item] of allowed) {
      const key = `s:${name}`;
      if (!form.has(key)) continue;
      let value = String(form.get(key) ?? "");
      if (item.type === "password" && !value) continue;
      if (item.type === "file") value = normalizeMediaPath(value);
      if (item.type === "select" && item.options && !item.options.some((o) => o.value === value))
        continue;
      if (existing.has(name)) await db.settings.updateMany({ where: { name }, data: { value } });
      else
        await db.settings.create({
          data: {
            name,
            label: item.label,
            value,
            type:
              item.type === "select" ? "option" : item.type === "textarea" ? "textarea" : "text",
            status: 0,
            pos: 1,
          },
        });
    }
    if (form.has("_theme")) {
      const row = await db.settings.findFirst({
        where: { name: "theme_setting" },
        select: { value: true },
      });
      let theme: Record<string, Record<string, string>> = {};
      try {
        theme = JSON.parse(row?.value || "{}");
      } catch {}
      for (const g of THEME_GROUPS) {
        theme[g] ??= {};
        for (const k of THEME_KEYS)
          theme[g][k.key] = String(form.get(`t:${g}:${k.key}`) ?? "").trim();
      }
      await db.settings.updateMany({
        where: { name: "theme_setting" },
        data: { value: JSON.stringify(theme) },
      });
    }
    revalidatePath("/admin", "layout");
    updateTag("site");
    return { ok: true, message: "Đã cập nhật cấu hình", at: Date.now() };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Có lỗi xảy ra", at: Date.now() };
  }
}

export async function sendTestMail(): Promise<SettingState> {
  try {
    const admin = await authorize("setting", "edit");
    const s = await getSettings();
    const to = s.email || admin.email;
    if (!to) throw new Error('Chưa có "Email nhận thông báo" hoặc email tài khoản để gửi thử');
    await sendMail(
      to,
      `Thử cấu hình SMTP - ${s.site_name || s.title || "Website"}`,
      "<p>Email thử từ trang quản trị. Cấu hình SMTP hoạt động.</p>",
    );
    return { ok: true, message: `Đã gửi email thử tới ${to}`, at: Date.now() };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Không gửi được email", at: Date.now() };
  }
}
