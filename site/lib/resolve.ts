import "server-only";
import { cache } from "react";
import { exec } from "@/lib/db";
import { categoryByNode, categoryOfNode, nodeBySlug, nodeDetail, type Cat } from "./data";
import type { Row } from "@/lib/db";

export type Resolved =
  | { kind: "category"; cur: Cat; page: number; base: string }
  | { kind: "product" | "news"; data: Row; cat: Cat | null }
  | { kind: "redirect"; to: string }
  | null;

export const resolve = cache(async (parts: string[]): Promise<Resolved> => {
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
    const cur = await categoryByNode(Number(node.id));
    if (!cur || cur.node.status != 1) return null;
    if (cur.ctype === "link") return { kind: "redirect", to: String(cur.link ?? "/") };
    return { kind: "category", cur, page, base: "/" + decodeURIComponent(parts[0]) };
  }
  if (node.type === "product" || node.type === "news") {
    const data = await nodeDetail(node.type, Number(node.id));
    if (!data) return null;
    return { kind: node.type, data, cat: await categoryOfNode(Number(node.id)) };
  }
  return null;
});

export async function countView(nodeId: number) {
  await exec("UPDATE nodes SET views = views + 1 WHERE id = ?", [nodeId]);
}
