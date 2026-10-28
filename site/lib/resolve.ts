import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { categoryByNode, categoryOfNode, type Cat } from "./queries/category";
import {
  newsDetail,
  nodeBySlug,
  productDetail,
  type NewsRow,
  type ProductRow,
} from "./queries/node";

export type Resolved =
  | { kind: "category"; cur: Cat; page: number; base: string }
  | { kind: "product"; data: ProductRow; cat: Cat | null }
  | { kind: "news"; data: NewsRow; cat: Cat | null }
  | { kind: "redirect"; to: string }
  | null;

export async function resolve(parts: string[]): Promise<Resolved> {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  if (parts.length > 2) return null;
  const slug = decodeURIComponent(parts[0]).replace(/\.html$/, "");
  if (!/^[a-zA-Z0-9-]+$/.test(slug)) return null;
  let page = 1;
  if (parts[1]) {
    const m = decodeURIComponent(parts[1]).match(/^page:(\d+)$/);
    if (!m) return null;
    page = Math.max(1, parseInt(m[1], 10));
  }
  const node = await nodeBySlug(slug);
  if (!node) return null;
  if (node.type === "category") {
    const cur = await categoryByNode(node.id);
    if (!cur || cur.node.status != 1) return null;
    if (cur.ctype === "link") return { kind: "redirect", to: String(cur.link ?? "/") };
    return { kind: "category", cur, page, base: "/" + decodeURIComponent(parts[0]) };
  }
  if (node.type === "product") {
    const data = await productDetail(node.id);
    return data ? { kind: "product", data, cat: await categoryOfNode(node.id) } : null;
  }
  if (node.type === "news") {
    const data = await newsDetail(node.id);
    return data ? { kind: "news", data, cat: await categoryOfNode(node.id) } : null;
  }
  return null;
}
