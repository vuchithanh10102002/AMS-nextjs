import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import type { ModuleDef } from "../types";

export const district: ModuleDef = {
  key: "district",
  title: "Quận huyện",
  table: "districts",
  positions: true,
  options: {
    cities: async () =>
      (
        await db.cities.findMany({
          select: { id: true, title: true },
          orderBy: [{ pos: "desc" }, { title: "asc" }],
        })
      ).map((c) => ({ value: String(c.id), label: String(c.title ?? "").trim() })),
  },
  list: {
    pageSize: 10,
    order: [{ pos: "desc" }, { id: "desc" }],
    filters: [
      { kind: "search", name: "s", label: "Tìm theo tên, điện thoại", columns: ["title", "phone"] },
      {
        kind: "select",
        name: "city_id",
        label: "Tỉnh/Thành phố",
        column: "city_id",
        optionsKey: "cities",
      },
    ],
    columns: [
      { name: "title", label: "Tên Quận huyện", link: true },
      { name: "_city", label: "Tỉnh" },
      { name: "phone", label: "Điện thoại" },
      { name: "pos", label: "Vị trí", kind: "pos" },
    ],
  },
  form: {
    fields: [
      { name: "title", label: "Tên Quận huyện", type: "text", required: true, maxLength: 100 },
      {
        name: "city_id",
        label: "Tỉnh/Thành phố",
        type: "select",
        required: true,
        optionsKey: "cities",
      },
      { name: "lat", label: "Vĩ độ", type: "text", half: true },
      { name: "lng", label: "Kinh độ", type: "text", half: true },
      { name: "phone", label: "Điện thoại", type: "text" },
      { name: "google_map", label: "Google map", type: "text", placeholder: "Link bản đồ" },
      { name: "address", label: "Địa chỉ", type: "text" },
    ],
  },
  hooks: {
    beforeSave: ({ main }, ctx) => {
      if (main.title !== undefined) main.slug = slugify(String(main.title));
      if (ctx.isNew) main.pos = 1;
    },
    decorate: async (rows) => {
      const ids = [...new Set(rows.map((r) => Number(r.city_id)).filter(Boolean))];
      const cities = ids.length
        ? await db.cities.findMany({
            where: { id: { in: ids } },
            select: { id: true, title: true },
          })
        : [];
      const byId = new Map(cities.map((c) => [c.id, c.title]));
      for (const r of rows) r._city = byId.get(Number(r.city_id)) ?? "";
    },
  },
};
