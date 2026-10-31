import { cacheLife, cacheTag } from "next/cache";
import { getSettings, siteUrl } from "@/lib/site";
import { catLink, withLang } from "@/site/lib/url";
import { childrenOf, menuRoots } from "@/site/lib/queries/category";

const clean = (s: unknown) =>
  String(s ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

async function llms() {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const [settings, roots] = await Promise.all([getSettings(), menuRoots()]);
  const base = siteUrl().replace(/\/+$/, "");
  const abs = (href: string) =>
    /^https?:\/\//.test(href) ? href : base + "/" + href.replace(/^\/+/, "");
  const lines = [`# ${clean(settings.title)}`, "", `> ${clean(settings.description)}`, ""];
  lines.push("## Trang chính", "", `- [Trang chủ](${base}/)`);
  for (const v of roots) lines.push(`- [${clean(v.node.title)}](${abs(catLink(v))})`);
  lines.push(`- [Liên hệ](${base}/lien-he)`, "");
  for (const v of roots) {
    const subs = await childrenOf(v);
    if (!subs.length) continue;
    lines.push(`## ${clean(v.node.title)}`, "");
    for (const c of subs) lines.push(`- [${clean(c.node.title)}](${abs(catLink(c))})`);
    lines.push("");
  }
  lines.push("## English", "", `- [Home](${base}/en)`);
  for (const v of roots)
    lines.push(
      `- [${clean(v.node.title_en) || clean(v.node.title)}](${abs(withLang(catLink(v), "en"))})`,
    );
  lines.push(`- [Contact](${base}/en/lien-he)`, "");
  return lines.join("\n");
}

export async function GET() {
  return new Response(await llms(), {
    headers: { "Content-Type": "text/plain; charset=UTF-8" },
  });
}
