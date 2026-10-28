import "server-only";
import { createHash } from "node:crypto";
import { columns, db, table, type Row } from "./db";
import { descendantIds, linkedCategoryIds, setLinkedCategories, categoryNamesByNode } from "./categories";
import { slugTaken, uniqueSlug, slugify } from "./slug";
import type { Admin } from "./session";
import type { Ctx, Field, ModuleDef } from "./modules/types";

export type ListParams = Record<string, string | undefined>;

const NODE_COLS = ["id", "title", "slug", "link", "type", "pos", "robots", "views", "created", "modified", "status"];

function fieldTarget(def: ModuleDef, f: Field) {
  if (!def.node) return "main";
  return f.target ?? (["title", "slug", "pos", "status", "robots", "created", "link"].includes(f.name) ? "node" : "main");
}

function flatten(def: ModuleDef, raw: Row): Row {
  const { node: n = {}, ...m } = raw;
  const extra = Object.fromEntries((def.form?.fields ?? []).filter((f) => f.target === "node" && f.name in n).map((f) => [f.name, n[f.name]]));
  return { ...m, ...extra, _mid: m.id, node: n, id: n.id, title: n.title, slug: n.slug, pos: n.pos, status: n.status, created: n.created, modified: n.modified, robots: n.robots, link: n.link };
}

function onNode(def: ModuleDef, name: string) {
  return !!def.node && NODE_COLS.includes(name);
}

function cond(def: ModuleDef, name: string, filter: unknown): Row {
  return onNode(def, name) ? { node: { is: { [name]: filter } } } : { [name]: filter };
}

function baseWhere(def: ModuleDef, admin?: Admin): Row[] {
  const and: Row[] = [];
  if (def.node) and.push({ node: { is: { type: def.node } } });
  const scope = admin ? def.scope?.(admin) : null;
  if (scope) and.push(scope);
  return and;
}

export async function listRecords(def: ModuleDef, params: ListParams, admin: Admin) {
  const and = baseWhere(def, admin);
  if (def.list.where) and.push(def.list.where);
  for (const f of def.list.filters ?? []) {
    const v = params[f.name]?.trim();
    if (f.kind === "daterange") {
      const from = params[`${f.name}_from`];
      const to = params[`${f.name}_to`];
      if (from) and.push(cond(def, f.column, { gte: f.unix ? Math.floor(new Date(from + "T00:00:00").getTime() / 1000) : from }));
      if (to) and.push(cond(def, f.column, { lte: f.unix ? Math.floor(new Date(to + "T23:59:59").getTime() / 1000) : to + " 23:59:59" }));
      continue;
    }
    if (!v) continue;
    if (f.kind === "search") and.push({ OR: f.columns.map((c) => cond(def, c, { contains: v })) });
    else if (f.kind === "select") and.push(cond(def, f.column, v));
    else if (f.kind === "category") {
      const links = await db.category_linkeds.findMany({ where: { category_id: { in: await descendantIds(Number(v)) } }, select: { node_id: true } });
      and.push({ node_id: { in: links.map((l) => l.node_id).filter((id): id is number => id != null) } });
    }
  }
  const where = and.length ? { AND: and } : {};
  const pageSize = def.list.pageSize ?? 20;
  const page = Math.max(1, Number(params.page) || 1);
  const dir = params.dir === "asc" ? "asc" : "desc";
  const sort = params.sort && (onNode(def, params.sort) || columns(def.table).has(params.sort)) ? params.sort : null;
  const orderBy = sort
    ? [onNode(def, sort) ? { node: { [sort]: dir } } : { [sort]: dir }]
    : def.list.order ?? (def.node ? [{ node: { pos: "desc" } }, { node: { id: "desc" } }] : [{ id: "desc" }]);

  const model = table(def.table);
  const total: number = await model.count({ where });
  const raw: Row[] = await model.findMany({ where, orderBy, take: pageSize, skip: (page - 1) * pageSize, include: def.node ? { node: true } : undefined });
  const rows = raw.map((r) => (def.node ? flatten(def, r) : r));

  if (def.list.columns.some((c) => c.kind === "categories")) {
    const names = await categoryNamesByNode(rows.map((r) => Number(def.node ? r.id : r.node_id)).filter(Boolean));
    for (const r of rows) r._categories = names.get(Number(def.node ? r.id : r.node_id)) ?? [];
  }
  await def.hooks?.decorate?.(rows);
  return { rows, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getRecord(def: ModuleDef, id: number, admin?: Admin): Promise<Row | null> {
  const scope = admin ? def.scope?.(admin) : null;
  const and: Row[] = [def.node ? { node_id: id, node: { isNot: null } } : { id }];
  if (scope) and.push(scope);
  const hit: Row | null = await table(def.table).findFirst({ where: { AND: and }, orderBy: { id: "asc" }, include: def.node ? { node: true } : undefined });
  if (!hit) return null;
  let row = def.node ? flatten(def, hit) : hit;
  for (const f of def.form?.fields ?? []) if (f.type === "categories") row[f.name] = await linkedCategoryIds(row.id);
  if (def.hooks?.load) row = await def.hooks.load(row);
  return row;
}

function md5(s: string) {
  return createHash("md5").update(s).digest("hex");
}

function toUnix(date: string) {
  if (!date) return null;
  const t = new Date(date.length <= 10 ? date + "T00:00:00" : date).getTime();
  return Number.isNaN(t) ? null : Math.floor(t / 1000);
}

export function parseField(f: Field, form: FormData): unknown {
  const raw = form.get(f.name);
  const str = raw == null ? "" : String(raw);
  switch (f.type) {
    case "number":
      return str === "" ? null : Number(str);
    case "money":
      return Number(str.replace(/\D/g, "")) || 0;
    case "switch":
      return str === "1" || str === "on" ? 1 : 0;
    case "multiselect":
    case "gallery": {
      const vals = form.getAll(f.name).map(String).filter((v) => v !== "");
      if (f.storage === "json") return JSON.stringify(vals);
      if (f.storage === "wrap") return vals.length ? `,${vals.join(",")},` : "";
      return vals.join(",");
    }
    case "date":
    case "datetime":
      if (f.storage === "unix") return toUnix(str);
      return str || null;
    case "password":
      return str ? md5(str) : undefined;
    case "readonly":
      return undefined;
    default:
      return str;
  }
}

export async function saveRecord(def: ModuleDef, id: number | null, form: FormData, admin: Admin) {
  const before = id ? await getRecord(def, id, admin) : null;
  if (id && !before) throw new Error("Không tìm thấy dữ liệu");
  const ctx: Ctx = { admin, id, isNew: !id, form, before };
  const node: Row = {};
  const main: Row = {};
  const categories: Record<string, string[]> = {};

  for (const f of def.form?.fields ?? []) {
    if (f.only === "add" && id) continue;
    if (f.only === "edit" && !id) continue;
    if (f.type === "custom" || f.type === "readonly") continue;
    if (f.type === "categories") {
      categories[f.name] = form.getAll(f.name).map(String);
      continue;
    }
    if (!form.has(f.name) && !["switch", "multiselect", "gallery"].includes(f.type)) continue;
    const v = parseField(f, form);
    if (v === undefined) continue;
    (fieldTarget(def, f) === "node" ? node : main)[f.name] = v;
  }

  for (const f of def.form?.fields ?? [])
    if (f.required && !["switch", "categories", "custom"].includes(f.type) && f.only !== (id ? "add" : "edit")) {
      const v = fieldTarget(def, f) === "node" ? node[f.name] : main[f.name];
      if ((v === "" || v == null) && (!id || f.name in (fieldTarget(def, f) === "node" ? node : main)))
        throw new Error(`Vui lòng nhập ${f.label}`);
    }

  await def.hooks?.beforeSave?.({ node, main }, ctx);

  if (def.node) {
    const now = Math.floor(Date.now() / 1000);
    if (!id) {
      node.type = def.node;
      node.slug = node.slug ? slugify(String(node.slug)) : await uniqueSlug(String(node.title ?? ""));
      if (await slugTaken(String(node.slug))) node.slug = await uniqueSlug(String(node.slug));
      node.created ??= now;
      node.modified = now;
      node.pos ??= 1;
      node.status ??= 1;
      const { id: nodeId } = await db.nodes.create({ data: omit(node, "id") as any });
      main.node_id = nodeId;
      await table(def.table).create({ data: omit(main, "id") });
      id = nodeId;
    } else {
      if ("slug" in node) {
        node.slug = slugify(String(node.slug)) || (await uniqueSlug(String(node.title ?? before!.title ?? "")));
        if (await slugTaken(String(node.slug), id)) throw new Error("Slug đã tồn tại, vui lòng chọn slug khác");
      }
      node.modified = now;
      await db.nodes.updateMany({ where: { id }, data: omit(node, "id") });
      const mainRow = omit(main, "id", "node_id");
      if (before!._mid) await table(def.table).updateMany({ where: { id: before!._mid }, data: mainRow });
      else await table(def.table).create({ data: { ...mainRow, node_id: id } });
    }
    for (const ids of Object.values(categories)) await setLinkedCategories(id, ids);
  } else {
    const row = omit(main, "id");
    if (!id) id = (await table(def.table).create({ data: row })).id as number;
    else await table(def.table).updateMany({ where: { id }, data: row });
  }

  await def.hooks?.afterSave?.(id!, { node, main }, { ...ctx, id });
  return id!;
}

function omit(row: Row, ...keys: string[]) {
  return Object.fromEntries(Object.entries(row).filter(([k]) => !keys.includes(k)));
}

export async function deleteRecords(def: ModuleDef, ids: number[], admin: Admin) {
  const rows: Row[] = [];
  for (const id of ids) {
    const r = await getRecord(def, id, admin);
    if (r) rows.push(r);
  }
  const found = rows.map((r) => Number(r.id));
  if (!found.length) return;
  if (def.node) {
    await table(def.table).deleteMany({ where: { node_id: { in: found } } });
    await db.category_linkeds.deleteMany({ where: { node_id: { in: found } } });
    await db.nodes.deleteMany({ where: { id: { in: found } } });
  } else await table(def.table).deleteMany({ where: { id: { in: found } } });
  await def.hooks?.afterDelete?.(found, rows);
}

export async function toggleField(def: ModuleDef, id: number, field: string, admin: Admin) {
  const allowed = [...(def.list.toggles ?? []), ...(def.statusToggle ? ["status"] : [])];
  if (!allowed.includes(field)) throw new Error("Trường không được phép bật/tắt");
  const row = await getRecord(def, id, admin);
  if (!row) throw new Error("Không tìm thấy dữ liệu");
  const value = Number(row[field]) ? 0 : 1;
  if (def.node && field === "status") await db.nodes.updateMany({ where: { id }, data: { status: value, modified: Math.floor(Date.now() / 1000) } });
  else await table(def.table).updateMany({ where: { id: def.node ? row._mid : id }, data: { [field]: value } });
  return value;
}

export async function savePositions(def: ModuleDef, positions: Record<string, number>, admin: Admin) {
  for (const [id, pos] of Object.entries(positions)) {
    const row = await getRecord(def, Number(id), admin);
    if (!row) continue;
    const data = { pos: Number.isFinite(pos) ? pos : 1 };
    if (def.node) await db.nodes.updateMany({ where: { id: Number(id) }, data });
    else await table(def.table).updateMany({ where: { id: Number(id) }, data });
  }
}

export async function copyRecord(def: ModuleDef, id: number, admin: Admin) {
  const row = await getRecord(def, id, admin);
  if (!row) throw new Error("Không tìm thấy dữ liệu");
  if (def.node) {
    const n = omit(row.node, "id");
    n.title = `${n.title ?? ""} (copy)`;
    n.slug = await uniqueSlug(String(n.title));
    n.status = 0;
    n.created = n.modified = Math.floor(Date.now() / 1000);
    const { id: nodeId } = await db.nodes.create({ data: n as any });
    const m: Row | null = await table(def.table).findUnique({ where: { id: row._mid } });
    if (m) await table(def.table).create({ data: { ...omit(m, "id"), node_id: nodeId } });
    await setLinkedCategories(nodeId, await linkedCategoryIds(id));
    return nodeId;
  }
  const found: Row | null = await table(def.table).findUnique({ where: { id } });
  if (!found) throw new Error("Không tìm thấy dữ liệu");
  const m = omit(found, "id");
  if ("title" in m) m.title = `${m.title ?? ""} (copy)`;
  if ("slug" in m) m.slug = slugify(String(m.title ?? ""));
  return (await table(def.table).create({ data: m })).id as number;
}
