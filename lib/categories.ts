import "server-only";
import { db } from "./db";

export type CategoryNode = {
  id: number;
  node_id: number;
  parent_id: number | null;
  title: string;
  ctype: string;
  depth: number;
};

async function loadAll() {
  const rows = await db.categories.findMany({
    select: { id: true, node_id: true, parent_id: true, ctype: true, node: { select: { title: true, status: true, pos: true } } },
    orderBy: [{ node: { pos: "desc" } }, { lft: "asc" }, { id: "asc" }],
  });
  return rows.map(({ node, ...c }) => ({ ...c, ctype: c.ctype ?? "", node_id: c.node_id ?? 0, title: node?.title ?? null, status: node?.status ?? null, pos: node?.pos ?? null }));
}

export async function categoryTree(opts: { ctype?: string | string[]; activeOnly?: boolean } = {}) {
  const rows = await loadAll();
  const ids = new Set(rows.map((r) => r.id));
  const children = new Map<number | null, typeof rows>();
  for (const r of rows) {
    const parent = r.parent_id && r.parent_id !== r.id && ids.has(r.parent_id) ? r.parent_id : null;
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent)!.push(r);
  }
  const types = opts.ctype ? (Array.isArray(opts.ctype) ? opts.ctype : [opts.ctype]) : null;
  const out: CategoryNode[] = [];
  const seen = new Set<number>();
  const walk = (parent: number | null, depth: number) => {
    for (const r of children.get(parent) ?? []) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      const keep = (!types || types.includes(r.ctype)) && (!opts.activeOnly || r.status === 1);
      if (keep)
        out.push({ id: r.id, node_id: r.node_id, parent_id: r.parent_id, title: (r.title ?? "").trim(), ctype: r.ctype, depth });
      walk(r.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

export async function categoryOptions(ctype?: string | string[], activeOnly = false) {
  const tree = await categoryTree({ ctype, activeOnly });
  return tree.map((c) => ({ value: String(c.id), label: `${"— ".repeat(c.depth)}${c.title}` }));
}

export async function descendantIds(categoryId: number) {
  const rows = await db.categories.findMany({ select: { id: true, parent_id: true } });
  const out = new Set<number>([categoryId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const r of rows)
      if (r.parent_id && r.parent_id !== r.id && out.has(r.parent_id) && !out.has(r.id)) {
        out.add(r.id);
        grew = true;
      }
  }
  return [...out];
}

export async function rebuildNestedSet() {
  const rows = await db.categories.findMany({ select: { id: true, parent_id: true }, orderBy: [{ lft: "asc" }, { id: "asc" }] });
  const ids = new Set(rows.map((r) => r.id));
  const children = new Map<number | null, number[]>();
  for (const r of rows) {
    const parent = r.parent_id && r.parent_id !== r.id && ids.has(r.parent_id) ? r.parent_id : null;
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent)!.push(r.id);
  }
  let counter = 0;
  const seen = new Set<number>();
  const updates: [number, number, number][] = [];
  const walk = (id: number) => {
    seen.add(id);
    const lft = ++counter;
    for (const c of children.get(id) ?? []) if (!seen.has(c)) walk(c);
    updates.push([lft, ++counter, id]);
  };
  for (const id of children.get(null) ?? []) walk(id);
  for (const r of rows) if (!seen.has(r.id)) walk(r.id);
  for (const [lft, rght, id] of updates) await db.categories.updateMany({ where: { id }, data: { lft, rght } });
}

export async function linkedCategoryIds(nodeId: number) {
  const rows = await db.category_linkeds.findMany({ where: { node_id: nodeId }, select: { category_id: true } });
  return rows.map((r) => String(r.category_id));
}

export async function setLinkedCategories(nodeId: number, categoryIds: (string | number)[]) {
  await db.category_linkeds.deleteMany({ where: { node_id: nodeId } });
  const unique = [...new Set(categoryIds.map(Number).filter((n) => n > 0))];
  if (unique.length) await db.category_linkeds.createMany({ data: unique.map((category_id) => ({ category_id, node_id: nodeId })) });
}

export async function categoryNamesByNode(nodeIds: number[]) {
  if (!nodeIds.length) return new Map<number, string[]>();
  const links = await db.category_linkeds.findMany({
    where: { node_id: { in: nodeIds } },
    select: { node_id: true, category: { select: { node: { select: { title: true } } } } },
  });
  const rows = links.flatMap((l) => (l.node_id != null && l.category?.node ? [{ node_id: l.node_id, title: l.category.node.title }] : []));
  const map = new Map<number, string[]>();
  for (const r of rows) {
    if (!map.has(r.node_id)) map.set(r.node_id, []);
    map.get(r.node_id)!.push((r.title ?? "").trim());
  }
  return map;
}
