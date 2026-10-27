import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { query } from "@/lib/db";

export type Lang = "vi" | "en";

export const getLang = cache(async (): Promise<Lang> => {
  const forced = (await headers()).get("x-site-lang");
  const value = forced || (await cookies()).get("lang")?.value;
  return value === "en" ? "en" : "vi";
});

const getLangRows = cache(async () => {
  const rows = await query<{ key: string; vi: string | null; en: string | null }>("SELECT `key`, vi, en FROM langs");
  return new Map(rows.map((r) => [r.key.toLowerCase(), r]));
});

const unslash = (s: string) => s.replace(/\\(.)/g, "$1");

export async function translator() {
  const [lang, rows] = await Promise.all([getLang(), getLangRows()]);
  const t = (key: string) => {
    const r = rows.get(key.toLowerCase());
    if (!r) return "";
    const v = lang === "en" ? r.en : r.vi;
    if (v != null && v.trim() !== "") return unslash(v);
    return unslash(r.vi ?? "");
  };
  const tr = (row: Record<string, unknown> | null | undefined, field: string) => {
    if (!row) return "";
    const vi = String(row[field] ?? "");
    if (lang === "vi") return vi;
    const en = row[`${field}_${lang}`];
    return typeof en === "string" && en.trim() !== "" ? en : vi;
  };
  return { lang, t, tr };
}

export type T = Awaited<ReturnType<typeof translator>>;
