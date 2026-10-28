import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db, type Plain } from "@/lib/db";
import type { categories, nodes } from "@/prisma/generated/client";
import { nodeOrder } from "./paged";

export type Cat = Plain<categories> & {
  node: Plain<Pick<nodes, "id" | "title" | "title_en" | "slug" | "pos" | "status" | "created">>;
};

export type CatFlag = "home_menu" | "featured" | "footer_1" | "footer_2" | "footer_3" | "footer_4";

export async function allCategories(): Promise<Cat[]> {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const rows = await db.categories.findMany({
    where: { node: { isNot: null } },
    include: {
      node: {
        select: {
          id: true,
          title: true,
          title_en: true,
          slug: true,
          pos: true,
          status: true,
          created: true,
        },
      },
    },
    orderBy: nodeOrder(),
  });
  return rows as Cat[];
}

export async function menuRoots() {
  return (await allCategories()).filter((c) => c.node.status == 1 && c.menu == 1 && !c.parent_id);
}

export async function childrenOf(cat: Cat) {
  return (await allCategories()).filter((c) => c.node.status == 1 && c.parent_id == cat.id);
}

export async function categoriesWhere(flag: CatFlag) {
  return (await allCategories()).filter((c) => c.node.status == 1 && c[flag] == 1);
}

export async function categoryById(id: number) {
  return (await allCategories()).find((c) => c.id == id) ?? null;
}

export async function categoryByNode(nodeId: number) {
  return (await allCategories()).find((c) => c.node.id == nodeId) ?? null;
}

export async function categoryByTemplate(template: string) {
  return (await allCategories()).find((c) => c.template === template) ?? null;
}

export async function categoryBySlug(slug: string) {
  return (await allCategories()).find((c) => c.node.slug === slug) ?? null;
}

export async function treeIds(cat: Cat) {
  return (await allCategories())
    .filter((c) => (c.lft ?? 0) >= (cat.lft ?? 0) && (c.rght ?? 0) <= (cat.rght ?? 0))
    .map((c) => c.id);
}

export async function treeIdsOf(id: number) {
  const cat = await categoryById(id);
  return cat ? treeIds(cat) : [];
}

export async function rootOf(cat: Cat): Promise<Cat> {
  const p = Number(cat.parent_id);
  if (p > 0) {
    const parent = await categoryById(p);
    if (parent) return rootOf(parent);
  }
  return cat;
}

export async function categoryOfNode(nodeId: number) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const r = await db.category_linkeds.findFirst({
    where: { node_id: nodeId },
    orderBy: { id: "asc" },
    select: { category_id: true },
  });
  return r ? categoryById(Number(r.category_id)) : null;
}
