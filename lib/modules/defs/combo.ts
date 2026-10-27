import { exec, query } from "@/lib/db";
import { distinctOptions } from "@/lib/crud";
import type { ModuleDef } from "../types";

export const combo: ModuleDef = {
  key: "combo",
  title: "Combo",
  table: "combos",
  positions: true,
  list: {
    pageSize: 20,
    order: "m.pos DESC, m.id DESC",
    filters: [{ kind: "search", name: "s", label: "Tìm theo tên combo", columns: ["title"] }],
    toggles: ["show", "status"],
    columns: [
      { name: "image", label: "Hình ảnh", kind: "image" },
      { name: "title", label: "Tên combo", link: true },
      { name: "_main", label: "SP chính" },
      { name: "_count", label: "Số SP", kind: "number" },
      { name: "price", label: "Giá combo", kind: "money" },
      { name: "price_save", label: "Tiết kiệm", kind: "money" },
      { name: "pos", label: "Vị trí", kind: "pos" },
      { name: "show", label: "Hiển thị trang chủ", kind: "toggle" },
      { name: "status", label: "Trạng thái", kind: "toggle" },
    ],
  },
  options: {
    products: () =>
      distinctOptions(
        "SELECT p.id value, n.title label FROM products p INNER JOIN nodes n ON n.id = p.node_id AND n.type = 'product' ORDER BY n.pos DESC, n.id DESC",
      ),
  },
  form: {
    fields: [
      { name: "title", label: "Tên combo", type: "text", required: true, maxLength: 255 },
      { name: "product_main", label: "Sản phẩm chính", type: "select", required: true, optionsKey: "products" },
      { name: "product_id", label: "Sản phẩm trong combo", type: "multiselect", storage: "wrap", required: true, optionsKey: "products" },
      { name: "price", label: "Giá combo", type: "money", half: true },
      { name: "price_save", label: "Giá tiết kiệm", type: "money", half: true },
      { name: "image", label: "Hình ảnh", type: "image", required: true },
      { name: "show", label: "Hiển thị trang chủ", type: "switch", default: 0, half: true },
      { name: "status", label: "Trạng thái", type: "switch", default: 1, half: true },
    ],
  },
  hooks: {
    beforeSave: async ({ main }, ctx) => {
      main.title = String(main.title ?? "").trim();
      main.price = String(main.price ?? 0);
      if (!ctx.isNew) return;
      const now = Math.floor(Date.now() / 1000);
      const res = await exec("INSERT INTO nodes SET ?", [{ title: main.title.slice(0, 128), type: "combo", pos: 1, status: 1, created: now, modified: now }]);
      main.node_id = res.insertId;
      main.created = now;
      main.pos ??= 0;
    },
    afterSave: async (id, { main }) => {
      const row = (await query<{ node_id: number | null }>("SELECT node_id FROM combos WHERE id = ?", [id]))[0];
      const now = Math.floor(Date.now() / 1000);
      if (row?.node_id) await exec("UPDATE nodes SET title = ?, modified = ? WHERE id = ? AND type = 'combo'", [String(main.title).slice(0, 128), now, row.node_id]);
      else {
        const res = await exec("INSERT INTO nodes SET ?", [{ title: String(main.title).slice(0, 128), type: "combo", pos: 1, status: 1, created: now, modified: now }]);
        await exec("UPDATE combos SET node_id = ? WHERE id = ?", [res.insertId, id]);
      }
    },
    afterDelete: async (_ids, rows) => {
      const nodeIds = rows.map((r) => Number(r.node_id)).filter(Boolean);
      if (nodeIds.length) await exec("DELETE FROM nodes WHERE id IN (?) AND type = 'combo'", [nodeIds]);
    },
    decorate: async (rows) => {
      const mainIds = [...new Set(rows.map((r) => Number(r.product_main)).filter(Boolean))];
      const names = mainIds.length
        ? await query<{ id: number; title: string }>("SELECT p.id, n.title FROM products p INNER JOIN nodes n ON n.id = p.node_id WHERE p.id IN (?)", [mainIds])
        : [];
      const map = new Map(names.map((n) => [n.id, String(n.title ?? "").trim()]));
      for (const r of rows) {
        r._main = map.get(Number(r.product_main)) ?? "";
        r._count = String(r.product_id ?? "").split(",").filter((x) => x.trim()).length;
      }
    },
  },
};
