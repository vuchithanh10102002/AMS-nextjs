import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import type { ModuleDef } from "../types";

export const city: ModuleDef = {
  key: "city",
  title: "Tỉnh/Thành phố",
  table: "cities",
  positions: true,
  statusToggle: true,
  options: {
    miens: async () =>
      (await db.miens.findMany({ select: { id: true, title: true }, orderBy: { id: "asc" } })).map(
        (m) => ({ value: String(m.id), label: String(m.title ?? "").trim() }),
      ),
  },
  list: {
    pageSize: 100,
    order: [{ pos: "desc" }, { id: "desc" }],
    filters: [
      { kind: "search", name: "s", label: "Tìm theo tên", columns: ["title"] },
      { kind: "select", name: "mien_id", label: "Miền", column: "mien_id", optionsKey: "miens" },
    ],
    columns: [
      { name: "title", label: "Tên thành phố/Tỉnh", link: true },
      { name: "_mien", label: "Miền" },
      { name: "pos", label: "Vị trí", kind: "pos" },
      { name: "status", label: "Trạng thái", kind: "toggle" },
    ],
  },
  form: {
    fields: [
      { name: "title", label: "Tên thành phố", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", only: "edit", help: "Để trống sẽ tạo từ tên" },
      { name: "mien_id", label: "Miền", type: "select", optionsKey: "miens" },
      { name: "latitude", label: "Vĩ độ", type: "number", half: true },
      { name: "longitude", label: "Kinh độ", type: "number", half: true },
    ],
  },
  hooks: {
    beforeSave: ({ main }, ctx) => {
      if (main.mien_id === "") main.mien_id = null;
      if (ctx.isNew || main.slug !== undefined)
        main.slug = slugify(String(main.slug || main.title || ctx.before?.title || ""));
      if (ctx.isNew) {
        main.pos = 1;
        main.status = 1;
      }
    },
    decorate: async (rows) => {
      const miens = new Map(
        (await db.miens.findMany({ select: { id: true, title: true } })).map((m) => [
          m.id,
          m.title,
        ]),
      );
      for (const r of rows) r._mien = miens.get(Number(r.mien_id)) ?? "";
    },
    afterDelete: async (ids) => {
      await db.districts.updateMany({ where: { city_id: { in: ids } }, data: { city_id: null } });
    },
  },
};
