import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import type { news, Prisma } from "@/prisma/generated/client";
import { treeIdsOf } from "./category";
import type { NewsRow } from "./node";
import { nodeOrder, paged, withNode, type Paged } from "./paged";

function newsPage(where: Prisma.newsWhereInput, page: number, limit: number) {
  return paged(
    page,
    limit,
    () => db.news.count({ where }),
    async (skip) => (await db.news.findMany({ where, orderBy: nodeOrder(), take: limit, skip, include: { node: true } })).map((r) => withNode<news>(r)),
  );
}

export async function newsList(categoryId: number, page: number, limit: number): Promise<Paged<NewsRow>> {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const ids = await treeIdsOf(categoryId);
  return newsPage({ node: { is: { status: 1, type: "news", category_linkeds: { some: { category_id: { in: ids } } } } } }, page, limit);
}

export async function newsSearch(key: string, page: number, limit: number): Promise<Paged<NewsRow>> {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  return newsPage({ node: { is: { type: "news", status: 1, ...(key ? { title: { contains: key } } : {}) } } }, page, limit);
}

export async function newsTags(nodeId: number) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const links = await db.category_linkeds.findMany({ where: { node_id: nodeId }, orderBy: { id: "asc" }, take: 10, select: { category_id: true } });
  const cats = await db.categories.findMany({
    where: { id: { in: links.flatMap((l) => (l.category_id == null ? [] : [l.category_id])) }, node: { isNot: null } },
    orderBy: nodeOrder(),
    take: 3,
    select: { node: { select: { title: true, title_en: true } } },
  });
  return cats.map((c) => ({ title: c.node!.title, title_en: c.node!.title_en }));
}
