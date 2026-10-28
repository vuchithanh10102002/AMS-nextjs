import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import type { ModuleDef } from "../types";

export const size: ModuleDef = {
  key: "size",
  title: "Dung tích",
  table: "sizes",
  positions: true,
  statusToggle: true,
  list: {
    pageSize: 12,
    order: [{ pos: "desc" }, { id: "desc" }],
    filters: [{ kind: "search", name: "s", label: "Tìm theo tên", columns: ["title"] }],
    columns: [
      { name: "title", label: "Tên", link: true },
      { name: "description", label: "Mô tả", kind: "html" },
      { name: "pos", label: "Vị trí", kind: "pos" },
      { name: "status", label: "Trạng thái", kind: "toggle" },
    ],
  },
  form: {
    fields: [
      { name: "title", label: "Tên", type: "text", required: true, maxLength: 64 },
      { name: "status", label: "Hiển thị", type: "switch", default: 1 },
      { name: "description", label: "Mô tả", type: "textarea", rows: 3 },
      { name: "content", label: "Nội dung", type: "editor", height: 300 },
    ],
  },
  hooks: {
    beforeSave: ({ main }, ctx) => {
      main.slug = slugify(String(main.title ?? ""));
      if (ctx.isNew) main.pos ??= 1;
    },
    afterDelete: async (ids) => {
      for (const id of ids)
        for (const p of await db.products.findMany({ where: { sizes: { contains: `,${id},` } }, select: { id: true, sizes: true } }))
          await db.products.updateMany({ where: { id: p.id }, data: { sizes: String(p.sizes).split(`,${id},`).join(",") } });
      await db.images.deleteMany({ where: { size_id: { in: ids } } });
    },
  },
};
