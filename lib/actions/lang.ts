"use server";

import { revalidatePath } from "next/cache";
import { exec, first } from "@/lib/db";
import { hasLink, isImageMode, LANG_MODES, LANGS, type LangMode } from "@/lib/lang-modes";
import { normalizeMediaPath } from "@/lib/media";
import { authorize } from "@/lib/perm";
import { siteUrl } from "@/lib/site";

export type LangState = { ok?: boolean; error?: string; message?: string; redirect?: string; at?: number };

const KEY_RE = /^[A-Za-z0-9_.\-]{1,64}$/;

function fail(e: unknown): LangState {
  return { error: e instanceof Error ? e.message : "Có lỗi xảy ra", at: Date.now() };
}

function column(lang: string) {
  if (!LANGS.some((l) => l.value === lang)) throw new Error("Ngôn ngữ không hợp lệ");
  return lang;
}

function imagePath(v: string) {
  let s = v.trim();
  const site = siteUrl();
  if (/^https?:\/\//.test(site) && s.startsWith(site)) s = s.slice(site.length);
  return normalizeMediaPath(s);
}

async function upsert(key: string, col: string, value: string) {
  await exec(`INSERT INTO langs (\`key\`, vi, en, pos) VALUES (?, '', '', 1) ON DUPLICATE KEY UPDATE \`key\` = \`key\``, [key]);
  await exec(`UPDATE langs SET \`${col}\` = ? WHERE \`key\` = ?`, [value, key]);
}

export async function saveLang(key: string, lang: string, mode: LangMode, _: LangState, form: FormData): Promise<LangState> {
  try {
    await authorize("lang", "edit");
    const col = column(lang);
    if (!LANG_MODES.some((m) => m.value === mode)) throw new Error("Chế độ sửa không hợp lệ");
    const row = await first<{ id: number }>("SELECT id FROM langs WHERE `key` = ?", [key]);
    if (!row) throw new Error("Khoá không tồn tại");
    const raw = String(form.get("value") ?? "");
    await exec(`UPDATE langs SET \`${col}\` = ? WHERE id = ?`, [isImageMode(mode) ? imagePath(raw) : raw, row.id]);
    if (isImageMode(mode) && form.has("mobile")) {
      const mobile = imagePath(String(form.get("mobile") ?? ""));
      await exec(`UPDATE langs SET \`${col}\` = ? WHERE \`key\` = ?`, [mobile, `${key}-mobile`]);
    }
    if (hasLink(mode) && form.has("link")) await upsert(`${key}_link`, col, String(form.get("link") ?? "").trim());
    if (mode === "image_link_text") {
      await upsert(`${key}_title`, col, String(form.get("title") ?? ""));
      await upsert(`${key}_description`, col, String(form.get("des") ?? ""));
    }
    revalidatePath("/admin/lang", "layout");
    return { ok: true, message: "Đã sửa", at: Date.now() };
  } catch (e) {
    return fail(e);
  }
}

export async function addLang(_: LangState, form: FormData): Promise<LangState> {
  try {
    await authorize("lang", "add");
    const key = String(form.get("key") ?? "").trim();
    if (!KEY_RE.test(key)) throw new Error("Key 1–64 ký tự, chỉ gồm chữ không dấu, số và _ - .");
    if (await first("SELECT id FROM langs WHERE `key` = ?", [key])) throw new Error("Key đã tồn tại");
    await exec("INSERT INTO langs SET ?", [{ key, vi: String(form.get("vi") ?? ""), en: String(form.get("en") ?? ""), pos: 1 }]);
    revalidatePath("/admin/lang", "layout");
    return { ok: true, message: "Đã thêm mới", redirect: `/admin/lang/${encodeURIComponent(key)}`, at: Date.now() };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteLang(key: string): Promise<LangState> {
  try {
    await authorize("lang", "delete");
    const res = await exec("DELETE FROM langs WHERE `key` = ?", [key]);
    if (!res.affectedRows) throw new Error("Khoá không tồn tại");
    revalidatePath("/admin/lang", "layout");
    return { ok: true, message: "Đã xoá", redirect: "/admin/lang", at: Date.now() };
  } catch (e) {
    return fail(e);
  }
}
