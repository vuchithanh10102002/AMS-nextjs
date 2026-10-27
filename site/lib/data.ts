import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { first, query, type Row } from "@/lib/db";

export type Cat = Row & { node: Row };

const CAT_SQL = "SELECT c.*, n.id AS n_id, n.title AS n_title, n.title_en AS n_title_en, n.slug AS n_slug, n.pos AS n_pos, n.status AS n_status, n.created AS n_created FROM categories c JOIN nodes n ON n.id = c.node_id";

function toCat(r: Row): Cat {
  const node: Row = { id: r.n_id, title: r.n_title, title_en: r.n_title_en, slug: r.n_slug, pos: r.n_pos, status: r.n_status, created: r.n_created };
  const c: Row = {};
  for (const [k, v] of Object.entries(r)) if (!k.startsWith("n_")) c[k] = v;
  return { ...c, node } as Cat;
}

export const allCategories = cache(async () => (await query(`${CAT_SQL} ORDER BY n.pos DESC, n.id DESC`)).map(toCat));

export async function menuRoots() {
  return (await allCategories()).filter((c) => c.node.status == 1 && c.menu == 1 && !c.parent_id);
}

export async function childrenOf(cat: Cat) {
  return (await allCategories()).filter((c) => c.node.status == 1 && c.parent_id == cat.id);
}

export async function categoriesWhere(flag: string) {
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

export async function treeIds(cat: Cat) {
  return (await allCategories()).filter((c) => c.lft >= cat.lft && c.rght <= cat.rght).map((c) => Number(c.id));
}

export async function ancestors(cat: Cat) {
  return (await allCategories()).filter((c) => c.lft <= cat.lft && c.rght >= cat.rght).sort((a, b) => a.lft - b.lft);
}

export const nodeBySlug = cache(async (slug: string) => first("SELECT * FROM nodes WHERE slug = ? LIMIT 1", [slug]));

export const getHangs = cache(async () => query("SELECT * FROM hangs WHERE status = 1 ORDER BY pos DESC, id DESC"));

export function link(slug: string) {
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

export type Paged<T> = { rows: T[]; page: number; pages: number; total: number };

export async function paged<T = Row>(sqlFrom: string, params: unknown[], order: string, page: number, limit: number, fields: string): Promise<Paged<T>> {
  const total = Number((await first<{ n: number }>(`SELECT COUNT(DISTINCT n.id) n ${sqlFrom}`, params))?.n ?? 0);
  const pages = Math.max(1, Math.ceil(total / limit));
  if (page > pages) redirect("/404.html");
  const rows = await query<T>(`SELECT ${fields} ${sqlFrom} GROUP BY n.id ORDER BY ${order} LIMIT ? OFFSET ?`, [...params, limit, (page - 1) * limit]);
  return { rows, page, pages, total };
}

export type ProductQuery = { brand?: string; cat?: string; items: number[]; sort?: string; page: number };

export async function productList(cat: Cat, q: ProductQuery, limit = 15) {
  const ids = await treeIds(cat);
  const joins = ["JOIN products p ON p.node_id = n.id", "JOIN category_linkeds cl ON cl.node_id = n.id"];
  const where = ["n.status = 1", "n.type = 'product'", `cl.category_id IN (${ids.map(() => "?").join(",") || "0"})`];
  const params: unknown[] = [...ids];
  const brands = String(q.brand ?? "").split(",").map((x) => parseInt(x, 10)).filter((x) => x > 0);
  if (brands.length) {
    where.push(`p.hang_id IN (${brands.map(() => "?").join(",")})`);
    params.push(...brands);
  }
  if (q.items.length) {
    joins.push("JOIN filter_linkeds fl ON fl.node_id = n.id");
    where.push(`fl.filter_item_id IN (${q.items.map(() => "?").join(",")})`);
    params.push(...q.items);
  }
  const catIds = String(q.cat ?? "").split(",").map((x) => parseInt(x, 10)).filter((x) => x > 0);
  if (catIds.length) {
    const groups = new Map<number, number[]>();
    for (const id of catIds) {
      const c = await categoryById(id);
      if (!c) continue;
      const g = Number(c.parent_id ?? 0);
      groups.set(g, [...(groups.get(g) ?? []), ...(await treeIds(c))]);
    }
    let i = 0;
    for (const list of groups.values()) {
      const a = `cf${i++}`;
      const uniq = [...new Set(list)];
      joins.push(`JOIN category_linkeds ${a} ON ${a}.node_id = n.id`);
      where.push(`${a}.category_id IN (${uniq.map(() => "?").join(",")})`);
      params.push(...uniq);
    }
  }
  const sorts: Record<string, string> = { "price-asc": "p.price asc, ", "price-desc": "p.price desc, ", "created-desc": "n.created desc, " };
  const order = `${sorts[q.sort ?? ""] ?? ""}n.pos DESC, n.id DESC`;
  return paged(`FROM nodes n ${joins.join(" ")} WHERE ${where.join(" AND ")}`, params, order, q.page, limit, "n.*, p.*, n.id AS node_id, p.id AS product_id");
}

export async function newsList(cat: Cat, page: number, limit = 9) {
  const ids = await treeIds(cat);
  return paged(
    `FROM nodes n JOIN news m ON m.node_id = n.id JOIN category_linkeds cl ON cl.node_id = n.id WHERE n.status = 1 AND n.type = 'news' AND cl.category_id IN (${ids.map(() => "?").join(",") || "0"})`,
    ids,
    "n.pos DESC, n.id DESC",
    page,
    limit,
    "n.*, m.*, n.id AS node_id, m.id AS news_id",
  );
}

const colCache = new Map<string, Set<string>>();

export async function getRows(table: string, where: Record<string, unknown> = {}, limit = 20) {
  if (!colCache.has(table)) colCache.set(table, new Set((await query<{ c: string }>("SELECT column_name c FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?", [table])).map((r) => r.c)));
  const cols = colCache.get(table)!;
  const conds = Object.entries(where).map(([k]) => `\`${k}\` = ?`);
  const params = Object.values(where);
  if (cols.has("status")) conds.push("status = 1");
  const order = [cols.has("pos") ? "pos DESC" : "", "id DESC"].filter(Boolean).join(", ");
  return query(`SELECT * FROM \`${table}\` ${conds.length ? "WHERE " + conds.join(" AND ") : ""} ORDER BY ${order} LIMIT ?`, [...params, limit]);
}

export async function getNodes(type: "product" | "news", opts: { categoryId?: number; where?: string; params?: unknown[]; limit?: number } = {}) {
  const table = type === "news" ? "news" : "products";
  const conds = ["n.status = 1"];
  const params: unknown[] = [];
  if (opts.categoryId) {
    const c = await categoryById(opts.categoryId);
    const ids = c ? await treeIds(c) : [];
    if (ids.length) {
      conds.push(`cl.category_id IN (${ids.map(() => "?").join(",")})`);
      params.push(...ids);
    }
  }
  if (opts.where) {
    conds.push(opts.where);
    params.push(...(opts.params ?? []));
  }
  return query(
    `SELECT n.*, m.*, n.id AS node_id, m.id AS main_id, cl.category_id AS cl_category_id FROM nodes n JOIN ${table} m ON m.node_id = n.id JOIN category_linkeds cl ON cl.node_id = n.id WHERE ${conds.join(" AND ")} GROUP BY cl.node_id ORDER BY n.pos DESC, n.id DESC LIMIT ?`,
    [...params, opts.limit ?? 20],
  );
}

export async function categoryBySlug(slug: string) {
  return (await allCategories()).find((c) => c.node.slug === slug) ?? null;
}

export async function nodeDetail(type: "product" | "news", nodeId: number) {
  const table = type === "news" ? "news" : "products";
  return first(`SELECT n.*, m.*, n.id AS node_id, m.id AS main_id FROM nodes n JOIN ${table} m ON m.node_id = n.id JOIN category_linkeds cl ON cl.node_id = n.id WHERE n.type = ? AND n.status = 1 AND n.id = ? LIMIT 1`, [type, nodeId]);
}

export async function categoryOfNode(nodeId: number) {
  const r = await first<{ category_id: number }>("SELECT category_id FROM category_linkeds WHERE node_id = ? ORDER BY id LIMIT 1", [nodeId]);
  return r ? categoryById(Number(r.category_id)) : null;
}
