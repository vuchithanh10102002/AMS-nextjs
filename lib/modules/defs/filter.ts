import { db } from "@/lib/db";
import type { ModuleDef } from "../types";

type Item = { id: number | null; title: string; content: string };

function readItems(form: FormData): Item[] {
  const ids = form.getAll("item_id").map(String);
  const titles = form.getAll("item_title").map(String);
  const contents = form.getAll("item_content").map(String);
  return titles
    .map((t, i) => ({ id: /^\d+$/.test(ids[i] ?? "") ? Number(ids[i]) : null, title: t.trim(), content: (contents[i] ?? "").trim() }))
    .filter((it) => it.title);
}

export const filter: ModuleDef = {
  key: "filter",
  title: "Bộ lọc nâng cao",
  table: "filters",
  positions: true,
  list: {
    pageSize: 12,
    order: [{ pos: "desc" }, { id: "desc" }],
    filters: [{ kind: "search", name: "s", label: "Tìm theo tên", columns: ["title"] }],
    columns: [
      { name: "title", label: "Tên", link: true },
      { name: "_items", label: "Tuỳ chọn" },
      { name: "_products", label: "Số SP gắn", kind: "number" },
      { name: "pos", label: "Vị trí", kind: "pos" },
    ],
  },
  form: {
    fields: [
      { name: "title", label: "Tên bộ lọc nâng cao", type: "text", required: true, maxLength: 64 },
      { name: "items", label: "Danh sách các tuỳ chọn", type: "custom", component: "filter-items" },
    ],
  },
  hooks: {
    load: async (row) => {
      row.items = await db.filter_items.findMany({ where: { filter_id: row.id }, select: { id: true, title: true, content: true }, orderBy: [{ pos: "asc" }, { id: "asc" }] });
      return row;
    },
    decorate: async (rows) => {
      const ids = rows.map((r) => Number(r.id));
      if (!ids.length) return;
      const items = await db.filter_items.findMany({ where: { filter_id: { in: ids } }, select: { filter_id: true, title: true }, orderBy: [{ pos: "asc" }, { id: "asc" }] });
      const links = await db.filter_linkeds.findMany({ where: { item: { is: { filter_id: { in: ids } } } }, select: { node_id: true, item: { select: { filter_id: true } } } });
      const counts = new Map<number, Set<number>>();
      for (const l of links) {
        const fid = Number(l.item?.filter_id);
        if (l.node_id == null) continue;
        if (!counts.has(fid)) counts.set(fid, new Set());
        counts.get(fid)!.add(l.node_id);
      }
      for (const r of rows) {
        r._items = items.filter((i) => i.filter_id === r.id).map((i) => i.title).join(", ");
        r._products = counts.get(r.id)?.size ?? 0;
      }
    },
    beforeSave: ({ main }, ctx) => {
      if (!readItems(ctx.form).length) throw new Error("Bạn chưa tạo thành phần bộ lọc");
      if (ctx.isNew) main.pos ??= 1;
    },
    afterSave: async (id, _, ctx) => {
      const items = readItems(ctx.form);
      const existing = new Set((await db.filter_items.findMany({ where: { filter_id: id }, select: { id: true } })).map((r) => r.id));
      const keep: number[] = [];
      for (const [i, it] of items.entries()) {
        const data = { title: it.title, content: it.content, pos: i + 1 };
        if (it.id && existing.has(it.id)) {
          await db.filter_items.updateMany({ where: { id: it.id }, data });
          keep.push(it.id);
        } else {
          const created = await db.filter_items.create({ data: { ...data, filter_id: id } });
          keep.push(created.id);
        }
      }
      const removed = [...existing].filter((x) => !keep.includes(x));
      if (removed.length) {
        await db.filter_linkeds.deleteMany({ where: { filter_item_id: { in: removed } } });
        await db.filter_items.deleteMany({ where: { id: { in: removed } } });
      }
    },
    afterDelete: async (ids) => {
      const itemIds = (await db.filter_items.findMany({ where: { filter_id: { in: ids } }, select: { id: true } })).map((i) => i.id);
      if (itemIds.length) await db.filter_linkeds.deleteMany({ where: { filter_item_id: { in: itemIds } } });
      await db.filter_items.deleteMany({ where: { filter_id: { in: ids } } });
      const cats = await db.categories.findMany({ where: { AND: [{ filter_id_list: { not: null } }, { filter_id_list: { not: "" } }] }, select: { id: true, filter_id_list: true } });
      for (const c of cats) {
        const list = String(c.filter_id_list).split(",");
        const next = list.filter((x) => !ids.includes(Number(x)));
        if (next.length !== list.length) await db.categories.updateMany({ where: { id: c.id }, data: { filter_id_list: next.join(",") } });
      }
    },
  },
};
