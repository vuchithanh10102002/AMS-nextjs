import "server-only";
import { siteUrl } from "@/lib/site";
import { site } from "./ctx";
import { categoryById, type Cat } from "./queries/category";
import type { NewsRow, ProductRow } from "./queries/node";

async function upTree(cat: Cat, ret: Cat[] = []): Promise<Cat[]> {
  if (!(Number(cat.parent_id) > 0)) return ret;
  const data = await categoryById(Number(cat.parent_id));
  if (data) ret.push(data);
  if (data && Number(data.parent_id) > 0) {
    ret.push(data);
    return upTree(data, ret);
  }
  return ret;
}

export async function crumbHtml(cur: Cat | null, single?: ProductRow | NewsRow | null) {
  const s = await site();
  const base = siteUrl();
  const suf = s.lang === "vi" ? "" : `_${s.lang}`;
  const items: { link: string; title: string }[] = [
    { link: base, title: s.t("home") || (s.lang === "vi" ? "Trang chủ" : "Home") },
  ];
  const links: string[] = [];
  if (cur) {
    for (const v of await upTree(cur)) {
      const link = `${base}${v.node.slug}.html`;
      const title = String((suf ? v.node.title_en : v.node.title) ?? "");
      if (!links.includes(link) && title !== "") {
        items.push({ link, title });
        links.push(link);
      }
    }
    const title = String((suf ? cur.node.title_en : cur.node.title) ?? "");
    if (title !== "") items.push({ link: `${base}${cur.node.slug}.html`, title });
  }
  let str = '<ol  itemscope itemtype="http://schema.org/BreadcrumbList">';
  let i = 0;
  for (const v of items) {
    if (v.title === "") continue;
    i++;
    str += `<li itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem" ${single ? `class="breadcrum-item-${i}"` : 'class="last"'}><a itemprop="item" href="${v.link}"><span itemprop="name">${v.title}</span></a><meta itemprop="position" content="${i}"></li>`;
  }
  if (single) {
    str += `<li itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem" class="last"><a itemprop="item" href="${base}${single.slug}.html"><span itemprop="name">${s.tr(single, "title")}</span></a><meta itemprop="position" content="${i + 1}"></li>`;
  }
  return str + "</ol>";
}
