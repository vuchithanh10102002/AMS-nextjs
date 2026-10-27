import { exec, query } from "@/lib/db";
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
    order: "m.pos DESC, m.id DESC",
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
      row.items = await query("SELECT id, title, content FROM filter_items WHERE filter_id = ? ORDER BY pos ASC, id ASC", [row.id]);
      return row;
    },
    decorate: async (rows) => {
      const ids = rows.map((r) => Number(r.id));
      if (!ids.length) return;
      const items = await query<{ filter_id: number; title: string }>("SELECT filter_id, title FROM filter_items WHERE filter_id IN (?) ORDER BY pos ASC, id ASC", [ids]);
      const counts = await query<{ filter_id: number; n: number }>(
        "SELECT i.filter_id, COUNT(DISTINCT l.node_id) n FROM filter_linkeds l JOIN filter_items i ON i.id = l.filter_item_id WHERE i.filter_id IN (?) GROUP BY i.filter_id",
        [ids],
      );
      for (const r of rows) {
        r._items = items.filter((i) => i.filter_id === r.id).map((i) => i.title).join(", ");
        r._products = counts.find((c) => c.filter_id === r.id)?.n ?? 0;
      }
    },
    beforeSave: ({ main }, ctx) => {
      if (!readItems(ctx.form).length) throw new Error("Bạn chưa tạo thành phần bộ lọc");
      if (ctx.isNew) main.pos ??= 1;
    },
    afterSave: async (id, _, ctx) => {
      const items = readItems(ctx.form);
      const existing = new Set((await query<{ id: number }>("SELECT id FROM filter_items WHERE filter_id = ?", [id])).map((r) => r.id));
      const keep: number[] = [];
      for (const [i, it] of items.entries()) {
        const data = { title: it.title, content: it.content, pos: i + 1 };
        if (it.id && existing.has(it.id)) {
          await exec("UPDATE filter_items SET ? WHERE id = ?", [data, it.id]);
          keep.push(it.id);
        } else {
          const res = await exec("INSERT INTO filter_items SET ?", [{ ...data, filter_id: id }]);
          keep.push(res.insertId);
        }
      }
      const removed = [...existing].filter((x) => !keep.includes(x));
      if (removed.length) {
        await exec("DELETE FROM filter_linkeds WHERE filter_item_id IN (?)", [removed]);
        await exec("DELETE FROM filter_items WHERE id IN (?)", [removed]);
      }
    },
    afterDelete: async (ids) => {
      await exec("DELETE l FROM filter_linkeds l JOIN filter_items i ON i.id = l.filter_item_id WHERE i.filter_id IN (?)", [ids]);
      await exec("DELETE FROM filter_items WHERE filter_id IN (?)", [ids]);
      const cats = await query<{ id: number; filter_id_list: string }>("SELECT id, filter_id_list FROM categories WHERE filter_id_list IS NOT NULL AND filter_id_list <> ''");
      for (const c of cats) {
        const list = c.filter_id_list.split(",");
        const next = list.filter((x) => !ids.includes(Number(x)));
        if (next.length !== list.length) await exec("UPDATE categories SET filter_id_list = ? WHERE id = ?", [next.join(","), c.id]);
      }
    },
  },
};
