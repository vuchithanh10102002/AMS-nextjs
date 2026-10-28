import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import type { Prisma, products } from "@/prisma/generated/client";
import { categoryById, treeIds, treeIdsOf } from "./category";
import type { ProductRow } from "./node";
import { nodeOrder, paged, withNode, type Paged } from "./paged";

export type ProductQuery = { brand?: string; cat?: string; items: number[]; sort?: string; page: number };

const SORTS: Record<string, Prisma.productsOrderByWithRelationInput> = {
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  "created-desc": { node: { created: "desc" } },
};

const ids = (v?: string) => String(v ?? "").split(",").map((x) => parseInt(x, 10)).filter((x) => x > 0);

function productPage(where: Prisma.productsWhereInput, orderBy: Prisma.productsOrderByWithRelationInput[], page: number, limit: number) {
  return paged(
    page,
    limit,
    () => db.products.count({ where }),
    async (skip) => (await db.products.findMany({ where, orderBy, take: limit, skip, include: { node: true } })).map((r) => withNode<products>(r)),
  );
}

export async function productList(categoryId: number, q: ProductQuery, limit: number): Promise<Paged<ProductRow>> {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const and: Prisma.productsWhereInput[] = [{ node: { is: { status: 1, type: "product", category_linkeds: { some: { category_id: { in: await treeIdsOf(categoryId) } } } } } }];
  const brands = ids(q.brand);
  if (brands.length) and.push({ hang_id: { in: brands } });
  if (q.items.length) and.push({ node: { is: { filter_linkeds: { some: { filter_item_id: { in: q.items } } } } } });
  const catIds = ids(q.cat);
  if (catIds.length) {
    const groups = new Map<number, number[]>();
    for (const id of catIds) {
      const c = await categoryById(id);
      if (!c) continue;
      const g = Number(c.parent_id ?? 0);
      groups.set(g, [...(groups.get(g) ?? []), ...(await treeIds(c))]);
    }
    for (const list of groups.values()) and.push({ node: { is: { category_linkeds: { some: { category_id: { in: [...new Set(list)] } } } } } });
  }
  const first = SORTS[q.sort ?? ""];
  return productPage({ AND: and }, first ? [first, ...nodeOrder()] : nodeOrder(), q.page, limit);
}

export async function productSearch(key: string, page: number, limit: number): Promise<Paged<ProductRow>> {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  return productPage({ node: { is: { type: "product", status: 1, ...(key ? { title: { contains: key } } : {}) } } }, nodeOrder(), page, limit);
}
