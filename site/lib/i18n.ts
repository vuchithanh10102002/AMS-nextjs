import "server-only";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";

export type Lang = "vi" | "en";

type LangRow = { vi: string | null; en: string | null };

export const getLang = cache(async (): Promise<Lang> => {
  const forced = (await headers()).get("x-site-lang");
  const value = forced || (await cookies()).get("lang")?.value;
  return value === "en" ? "en" : "vi";
});

async function getLangRows(): Promise<Record<string, LangRow>> {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const rows = await db.langs.findMany({ select: { key: true, vi: true, en: true } });
  return Object.fromEntries(rows.map((r) => [(r.key ?? "").toLowerCase(), { vi: r.vi, en: r.en }]));
}

const unslash = (s: string) => s.replace(/\\(.)/g, "$1");

export async function translator() {
  const [lang, rows] = await Promise.all([getLang(), getLangRows()]);
  const t = (key: string) => {
    const k = key.toLowerCase();
    if (!Object.hasOwn(rows, k)) return "";
    const r = rows[k];
    const v = lang === "en" ? r.en : r.vi;
    if (v != null && v.trim() !== "") return unslash(v);
    return unslash(r.vi ?? "");
  };
  const tr = <R extends object>(row: R | null | undefined, field: Extract<keyof R, string>) => {
    if (!row) return "";
    const rec = row as Record<string, unknown>;
    const vi = String(rec[field] ?? "");
    if (lang === "vi") return vi;
    const en = rec[`${field}_${lang}`];
    return typeof en === "string" && en.trim() !== "" ? en : vi;
  };
  return { lang, t, tr };
}

export type T = Awaited<ReturnType<typeof translator>>;
