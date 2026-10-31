import "server-only";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { site } from "./ctx";
import { withLang } from "./url";

const clean = (s: unknown) =>
  String(s ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

export async function pageMeta(m: {
  title?: string;
  description?: string;
  keywords?: string;
  path: string;
  image?: string | null;
}): Promise<Metadata> {
  const s = await site();
  const base = siteUrl();
  const abs = (p: string) => (/^https?:\/\//.test(p) ? p : base + p.replace(/^\/+/, ""));
  const title = clean(m.title);
  const description = clean(m.description);
  const fav = String(s.settings.favicon ?? "");
  return {
    title: { absolute: title },
    description: description || undefined,
    keywords: clean(m.keywords) || undefined,
    robots: { index: false, follow: false },
    alternates: {
      canonical: abs(s.u(m.path)),
      languages: { vi: abs(m.path), en: abs(withLang(m.path, "en")) },
    },
    icons: fav ? { icon: [{ url: abs(fav), type: "image/png" }] } : undefined,
    openGraph: {
      siteName: clean(s.settings.title),
      url: abs(s.u(m.path)),
      title,
      description,
      images: [abs(m.image || s.settings.image_share || "")],
    },
  };
}
