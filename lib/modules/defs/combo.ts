import { db } from "@/lib/db";
import type { ModuleDef } from "../types";

export const combo: ModuleDef = {
  key: "combo",
  title: "Combo",
  table: "combos",
  positions: true,
  list: {
    pageSize: 20,
    order: [{ pos: "desc" }, { id: "desc" }],
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
    products: async () =>
      (
        await db.products.findMany({
          where: { node: { is: { type: "product" } } },
          select: { id: true, node: { select: { title: true } } },
          orderBy: [{ node: { pos: "desc" } }, { node: { id: "desc" } }],
        })
      ).map((p) => ({ value: String(p.id), label: String(p.node?.title ?? "").trim() })),
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
      const node = await db.nodes.create({ data: { title: main.title.slice(0, 128), type: "combo", pos: 1, status: 1, created: now, modified: now } });
      main.node_id = node.id;
      main.created = now;
      main.pos ??= 0;
    },
    afterSave: async (id, { main }) => {
      const row = await db.combos.findUnique({ where: { id }, select: { node_id: true } });
      const now = Math.floor(Date.now() / 1000);
      if (row?.node_id) await db.nodes.updateMany({ where: { id: row.node_id, type: "combo" }, data: { title: String(main.title).slice(0, 128), modified: now } });
      else {
        const node = await db.nodes.create({ data: { title: String(main.title).slice(0, 128), type: "combo", pos: 1, status: 1, created: now, modified: now } });
        await db.combos.updateMany({ where: { id }, data: { node_id: node.id } });
      }
    },
    afterDelete: async (_ids, rows) => {
      const nodeIds = rows.map((r) => Number(r.node_id)).filter(Boolean);
      if (nodeIds.length) await db.nodes.deleteMany({ where: { id: { in: nodeIds }, type: "combo" } });
    },
    decorate: async (rows) => {
      const mainIds = [...new Set(rows.map((r) => Number(r.product_main)).filter(Boolean))];
      const names = mainIds.length
        ? await db.products.findMany({ where: { id: { in: mainIds }, node: { isNot: null } }, select: { id: true, node: { select: { title: true } } } })
        : [];
      const map = new Map(names.map((n) => [n.id, String(n.node?.title ?? "").trim()]));
      for (const r of rows) {
        r._main = map.get(Number(r.product_main)) ?? "";
        r._count = String(r.product_id ?? "").split(",").filter((x) => x.trim()).length;
      }
    },
  },
};
