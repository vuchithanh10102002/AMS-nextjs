import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import type { news, products } from "@/prisma/generated/client";
import { treeIdsOf } from "./category";
import { nodeOrder, withNode, type Entry } from "./paged";

export type ProductRow = Entry<products>;
export type NewsRow = Entry<news>;

const live = (ids: number[]) => ({ is: { status: 1, category_linkeds: { some: ids.length ? { category_id: { in: ids } } : {} } } });

export async function nodeBySlug(slug: string) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  return db.nodes.findFirst({ where: { slug }, select: { id: true, type: true } });
}

export async function productDetail(nodeId: number): Promise<ProductRow | null> {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const r = await db.products.findFirst({
    where: { node_id: nodeId, node: { is: { type: "product", status: 1, category_linkeds: { some: {} } } } },
    include: { node: true },
  });
  return r ? withNode<products>(r) : null;
}

export async function newsDetail(nodeId: number): Promise<NewsRow | null> {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const r = await db.news.findFirst({
    where: { node_id: nodeId, node: { is: { type: "news", status: 1, category_linkeds: { some: {} } } } },
    include: { node: true },
  });
  return r ? withNode<news>(r) : null;
}

export async function newsIn(categoryId: number, limit: number, exceptNode?: number): Promise<NewsRow[]> {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const rows = await db.news.findMany({
    where: { ...(exceptNode ? { node_id: { not: exceptNode } } : {}), node: live(await treeIdsOf(categoryId)) },
    orderBy: nodeOrder(),
    take: limit,
    include: { node: true },
  });
  return rows.map((r) => withNode<news>(r));
}

export async function productsIn(categoryId: number, limit: number, exceptNode?: number): Promise<ProductRow[]> {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const rows = await db.products.findMany({
    where: { ...(exceptNode ? { node_id: { not: exceptNode } } : {}), node: live(await treeIdsOf(categoryId)) },
    orderBy: nodeOrder(),
    take: limit,
    include: { node: true },
  });
  return rows.map((r) => withNode<products>(r));
}

export async function countProducts(categoryId: number, hangId?: number) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  return db.products.count({ where: { ...(hangId ? { hang_id: hangId } : {}), node: live(await treeIdsOf(categoryId)) } });
}

export async function countView(nodeId: number) {
  await db.nodes.updateMany({ where: { id: nodeId }, data: { views: { increment: 1 } } });
}
