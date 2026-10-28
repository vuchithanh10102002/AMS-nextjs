import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import type { ModuleDef } from "../types";

export const hang: ModuleDef = {
  key: "hang",
  title: "Hãng",
  table: "hangs",
  positions: true,
  statusToggle: true,
  list: {
    pageSize: 12,
    order: [{ pos: "desc" }, { id: "desc" }],
    filters: [{ kind: "search", name: "s", label: "Tìm theo tên", columns: ["title"] }],
    toggles: ["featured", "active_category"],
    columns: [
      { name: "image", label: "Hình ảnh", kind: "image" },
      { name: "title", label: "Tên", link: true },
      { name: "pos", label: "Vị trí", kind: "pos" },
      { name: "featured", label: "Nổi bật", kind: "toggle" },
      { name: "active_category", label: "Tuần lễ thương hiệu", kind: "toggle" },
      { name: "status", label: "Trạng thái", kind: "toggle" },
    ],
  },
  form: {
    fields: [
      { name: "title", label: "Tên", type: "text", required: true },
      { name: "image", label: "Hình ảnh", type: "image" },
    ],
  },
  hooks: {
    beforeSave: ({ main }, ctx) => {
      main.slug = slugify(String(main.title ?? ""));
      if (ctx.isNew) {
        main.status ??= 1;
        main.pos ??= 1;
      }
    },
    afterDelete: async (ids) => {
      await db.products.updateMany({ where: { hang_id: { in: ids } }, data: { hang_id: null } });
    },
  },
};
