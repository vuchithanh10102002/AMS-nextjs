import "server-only";
import { createHash } from "node:crypto";
import { columns as tableColumns, exec, first, pool, query, type Row } from "./db";
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
  if (!def.node) return raw;
  const m = raw.m ?? {};
  const n = raw.n ?? {};
  const extra = Object.fromEntries((def.form?.fields ?? []).filter((f) => f.target === "node" && f.name in n).map((f) => [f.name, n[f.name]]));
  return { ...m, ...extra, _mid: m.id, node: n, id: n.id, title: n.title, slug: n.slug, pos: n.pos, status: n.status, created: n.created, modified: n.modified, robots: n.robots, link: n.link };
}

function fromClause(def: ModuleDef) {
  if (!def.node) return `\`${def.table}\` m`;
  return `nodes n INNER JOIN \`${def.table}\` m ON m.node_id = n.id`;
}

function col(def: ModuleDef, name: string) {
  if (name.includes(".")) return name;
  if (def.node && NODE_COLS.includes(name)) return `n.\`${name}\``;
  return `m.\`${name}\``;
}

export async function listRecords(def: ModuleDef, params: ListParams, admin: Admin) {
  const where: string[] = [];
  const args: unknown[] = [];
  if (def.node) {
    where.push("n.type = ?");
    args.push(def.node);
  }
  if (def.list.where) {
    where.push(def.list.where);
    args.push(...(def.list.params ?? []));
  }
  const scope = def.scope?.(admin);
  if (scope) {
    where.push(scope.where);
    args.push(...scope.params);
  }
  for (const f of def.list.filters ?? []) {
    const v = params[f.name]?.trim();
    if (f.kind === "daterange") {
      const from = params[`${f.name}_from`];
      const to = params[`${f.name}_to`];
      if (from) {
        where.push(`${col(def, f.column)} >= ?`);
        args.push(f.unix ? Math.floor(new Date(from + "T00:00:00").getTime() / 1000) : from);
      }
      if (to) {
        where.push(`${col(def, f.column)} <= ?`);
        args.push(f.unix ? Math.floor(new Date(to + "T23:59:59").getTime() / 1000) : to + " 23:59:59");
      }
      continue;
    }
    if (!v) continue;
    if (f.kind === "search") {
      where.push("(" + f.columns.map((c) => `${col(def, c)} LIKE ?`).join(" OR ") + ")");
      f.columns.forEach(() => args.push(`%${v}%`));
    } else if (f.kind === "select") {
      where.push(`${col(def, f.column)} = ?`);
      args.push(v);
    } else if (f.kind === "category") {
      const ids = await descendantIds(Number(v));
      where.push(`${def.node ? "n.id" : "m.node_id"} IN (SELECT node_id FROM category_linkeds WHERE category_id IN (?))`);
      args.push(ids);
    }
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const pageSize = def.list.pageSize ?? 20;
  const page = Math.max(1, Number(params.page) || 1);
  const sort = params.sort && /^[a-z0-9_]+$/.test(params.sort) ? params.sort : null;
  const dir = params.dir === "asc" ? "ASC" : "DESC";
  const order = sort ? `${col(def, sort)} ${dir}` : def.list.order ?? (def.node ? "n.pos DESC, n.id DESC" : "m.id DESC");

  const total = (await first<{ n: number }>(`SELECT COUNT(*) n FROM ${fromClause(def)} ${whereSql}`, args))?.n ?? 0;
  const [raw] = await pool.query({
    sql: `SELECT ${def.node ? "n.*, m.*" : "m.*"} FROM ${fromClause(def)} ${whereSql} ORDER BY ${order} LIMIT ? OFFSET ?`,
    values: [...args, pageSize, (page - 1) * pageSize],
    nestTables: def.node ? true : undefined,
  } as any);
  const rows = (raw as Row[]).map((r) => (def.node ? flatten(def, r) : r));

  if (def.list.columns.some((c) => c.kind === "categories")) {
    const names = await categoryNamesByNode(rows.map((r) => Number(def.node ? r.id : r.node_id)).filter(Boolean));
    for (const r of rows) r._categories = names.get(Number(def.node ? r.id : r.node_id)) ?? [];
  }
  await def.hooks?.decorate?.(rows);
  return { rows, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getRecord(def: ModuleDef, id: number, admin?: Admin): Promise<Row | null> {
  const scope = admin ? def.scope?.(admin) : null;
  const [raw] = await pool.query({
    sql: `SELECT ${def.node ? "n.*, m.*" : "m.*"} FROM ${fromClause(def)} WHERE ${def.node ? "n.id" : "m.id"} = ?${scope ? ` AND ${scope.where}` : ""} LIMIT 1`,
    values: [id, ...(scope?.params ?? [])],
    nestTables: def.node ? true : undefined,
  } as any);
  const hit = (raw as Row[])[0];
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
      const nodeCols = await tableColumns("nodes");
      const res = await exec("INSERT INTO nodes SET ?", [Object.fromEntries(Object.entries(node).filter(([k]) => nodeCols.has(k)))]);
      const nodeId = res.insertId;
      main.node_id = nodeId;
      const mainCols = await tableColumns(def.table);
      await exec(`INSERT INTO \`${def.table}\` SET ?`, [Object.fromEntries(Object.entries(main).filter(([k]) => mainCols.has(k) && k !== "id"))]);
      id = nodeId;
    } else {
      if ("slug" in node) {
        node.slug = slugify(String(node.slug)) || (await uniqueSlug(String(node.title ?? before!.title ?? "")));
        if (await slugTaken(String(node.slug), id)) throw new Error("Slug đã tồn tại, vui lòng chọn slug khác");
      }
      node.modified = now;
      const nodeCols = await tableColumns("nodes");
      const nodeRow = Object.fromEntries(Object.entries(node).filter(([k]) => nodeCols.has(k) && k !== "id"));
      if (Object.keys(nodeRow).length) await exec("UPDATE nodes SET ? WHERE id = ?", [nodeRow, id]);
      const mainCols = await tableColumns(def.table);
      const mainRow = Object.fromEntries(Object.entries(main).filter(([k]) => mainCols.has(k) && k !== "id" && k !== "node_id"));
      if (before!._mid) {
        if (Object.keys(mainRow).length) await exec(`UPDATE \`${def.table}\` SET ? WHERE id = ?`, [mainRow, before!._mid]);
      } else await exec(`INSERT INTO \`${def.table}\` SET ?`, [{ ...mainRow, node_id: id }]);
    }
    for (const ids of Object.values(categories)) await setLinkedCategories(id, ids);
  } else {
    const mainCols = await tableColumns(def.table);
    const row = Object.fromEntries(Object.entries(main).filter(([k]) => mainCols.has(k) && k !== "id"));
    if (!id) {
      const res = await exec(`INSERT INTO \`${def.table}\` SET ?`, [row]);
      id = res.insertId;
    } else if (Object.keys(row).length) await exec(`UPDATE \`${def.table}\` SET ? WHERE id = ?`, [row, id]);
  }

  await def.hooks?.afterSave?.(id!, { node, main }, { ...ctx, id });
  return id!;
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
    await exec(`DELETE FROM \`${def.table}\` WHERE node_id IN (?)`, [found]);
    await exec("DELETE FROM category_linkeds WHERE node_id IN (?)", [found]);
    await exec("DELETE FROM nodes WHERE id IN (?)", [found]);
  } else await exec(`DELETE FROM \`${def.table}\` WHERE id IN (?)`, [found]);
  await def.hooks?.afterDelete?.(found, rows);
}

export async function toggleField(def: ModuleDef, id: number, field: string, admin: Admin) {
  const allowed = [...(def.list.toggles ?? []), ...(def.statusToggle ? ["status"] : [])];
  if (!allowed.includes(field)) throw new Error("Trường không được phép bật/tắt");
  const row = await getRecord(def, id, admin);
  if (!row) throw new Error("Không tìm thấy dữ liệu");
  const value = Number(row[field]) ? 0 : 1;
  if (def.node && field === "status") await exec("UPDATE nodes SET status = ?, modified = ? WHERE id = ?", [value, Math.floor(Date.now() / 1000), id]);
  else if (def.node) await exec(`UPDATE \`${def.table}\` SET \`${field}\` = ? WHERE id = ?`, [value, row._mid]);
  else await exec(`UPDATE \`${def.table}\` SET \`${field}\` = ? WHERE id = ?`, [value, id]);
  return value;
}

export async function savePositions(def: ModuleDef, positions: Record<string, number>, admin: Admin) {
  for (const [id, pos] of Object.entries(positions)) {
    const row = await getRecord(def, Number(id), admin);
    if (!row) continue;
    const value = Number.isFinite(pos) ? pos : 1;
    if (def.node) await exec("UPDATE nodes SET pos = ? WHERE id = ?", [value, id]);
    else await exec(`UPDATE \`${def.table}\` SET pos = ? WHERE id = ?`, [value, id]);
  }
}

export async function copyRecord(def: ModuleDef, id: number, admin: Admin) {
  const row = await getRecord(def, id, admin);
  if (!row) throw new Error("Không tìm thấy dữ liệu");
  if (def.node) {
    const n = { ...row.node };
    delete n.id;
    n.title = `${n.title ?? ""} (copy)`;
    n.slug = await uniqueSlug(String(n.title));
    n.status = 0;
    n.created = n.modified = Math.floor(Date.now() / 1000);
    const res = await exec("INSERT INTO nodes SET ?", [n]);
    const m = await first(`SELECT * FROM \`${def.table}\` WHERE id = ?`, [row._mid]);
    if (m) {
      delete m.id;
      m.node_id = res.insertId;
      await exec(`INSERT INTO \`${def.table}\` SET ?`, [m]);
    }
    await setLinkedCategories(res.insertId, await linkedCategoryIds(id));
    return res.insertId;
  }
  const m = await first(`SELECT * FROM \`${def.table}\` WHERE id = ?`, [id]);
  if (!m) throw new Error("Không tìm thấy dữ liệu");
  delete m.id;
  if ("title" in m) m.title = `${m.title ?? ""} (copy)`;
  if ("slug" in m) m.slug = slugify(String(m.title ?? ""));
  const res = await exec(`INSERT INTO \`${def.table}\` SET ?`, [m]);
  return res.insertId;
}

export async function distinctOptions(sql: string, params: unknown[] = []) {
  const rows = await query<{ value: string | number; label: string }>(sql, params);
  return rows.map((r) => ({ value: String(r.value), label: String(r.label ?? "").trim() }));
}
