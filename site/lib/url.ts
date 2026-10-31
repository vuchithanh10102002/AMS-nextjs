import type { Cat } from "./queries/category";

export type Query = Record<string, string | string[] | undefined>;

export function link(slug: string | null) {
  return `/${slug}.html`;
}

export function catLink(cat: Cat) {
  return cat.ctype === "link" ? String(cat.link ?? "") : link(String(cat.node.slug));
}

export function src(path?: string | null) {
  const p = String(path ?? "").trim();
  if (!p) return "";
  if (/^https?:\/\//.test(p) || p.startsWith("data:")) return p;
  return "/" + p.replace(/^\/+/, "");
}

export function queryString(q: Query) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(q))
    for (const x of Array.isArray(v) ? v : [v ?? ""]) u.append(k, x);
  return u.toString();
}

export function withLang(href: string, lang: string) {
  if (lang !== "en" || !href.startsWith("/") || href.startsWith("//")) return href;
  if (href === "/en" || href.startsWith("/en/")) return href;
  return href === "/" ? "/en" : "/en" + href;
}

export function langHref(v: string) {
  return v === "" || v === "#" || v.includes(":") ? v : "/" + v.replace(/^\/+/, "");
}

export function tel(phone: string) {
  return phone.replace(/[^0-9+]/g, "");
}
