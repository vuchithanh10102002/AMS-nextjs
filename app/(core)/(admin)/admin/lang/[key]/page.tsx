import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LangEditForm } from "@/components/admin/lang/lang-forms";
import { SetBreadcrumb } from "@/components/set-breadcrumb";
import { db } from "@/lib/db";
import { LANG_MODES, LANGS, modeFromQuery, type LangMode } from "@/lib/lang-modes";
import declared from "@/site/lang-modes.json";
import { can } from "@/lib/perm";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Sửa khoá giao diện" };

type LangRow = { key: string; vi: string | null; en: string | null };

function guessMode(v: string): LangMode {
  if (/\.(jpe?g|png|gif|webp|svg|avif)$/i.test(v.trim())) return "image";
  if (/<(p|div|br|ul|h\d|span|strong|a)\b/i.test(v)) return "editor";
  if (v.includes("\n")) return "textarea";
  return "text";
}

export default async function LangEditPage({ params, searchParams }: PageProps<"/admin/lang/[key]">) {
  const [{ key: raw }, sp] = await Promise.all([params, searchParams]);
  const admin = await requireAdmin();
  if (!can(admin, "lang", "edit")) redirect("/admin?denied=1");
  const key = decodeURIComponent(raw);
  const row = (await db.langs.findUnique({ where: { key }, select: { key: true, vi: true, en: true } })) as LangRow | null;
  if (!row) notFound();
  const lang = LANGS.find((l) => l.value === sp.lang)?.value ?? "vi";
  const value = String(row[lang] ?? "");
  const fixed = (declared as Record<string, string>)[key];
  const mode = LANG_MODES.find((m) => m.value === fixed)?.value ?? modeFromQuery(sp) ?? guessMode(value);
  const sats = (await db.langs.findMany({
    where: { key: { in: [`${key}_link`, `${key}_title`, `${key}_description`, `${key}-mobile`] } },
    select: { key: true, vi: true, en: true },
  })) as LangRow[];
  const sat = (suffix: string) => {
    const r = sats.find((s) => s.key === key + suffix);
    return r ? String(r[lang] ?? "") : null;
  };
  return (
    <>
      <SetBreadcrumb segment={raw} label={key} />
      <LangEditForm
        key={`${lang}-${mode}`}
        data={{
          key,
          lang,
          mode,
          value,
          mobile: sat("-mobile"),
          link: sat("_link") ?? "",
          title: sat("_title") ?? "",
          des: sat("_description") ?? "",
          canDelete: can(admin, "lang", "delete"),
        }}
      />
    </>
  );
}
