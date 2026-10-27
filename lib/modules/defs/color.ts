import { exec } from "@/lib/db";
import { slugify } from "@/lib/slug";
import type { ModuleDef } from "../types";

export const color: ModuleDef = {
  key: "color",
  title: "Màu sắc",
  table: "colors",
  positions: true,
  statusToggle: true,
  list: {
    pageSize: 12,
    order: "m.pos DESC, m.id DESC",
    filters: [{ kind: "search", name: "s", label: "Tìm theo tên", columns: ["title", "color"] }],
    columns: [
      { name: "title", label: "Tên", link: true },
      { name: "color", label: "Mã màu" },
      { name: "pos", label: "Vị trí", kind: "pos" },
      { name: "status", label: "Trạng thái", kind: "toggle" },
    ],
  },
  form: {
    fields: [
      { name: "title", label: "Tên", type: "text", required: true, maxLength: 64 },
      { name: "color", label: "Màu sắc", type: "color", required: true, half: true },
      { name: "status", label: "Hiển thị", type: "switch", default: 1, half: true },
      { name: "image", label: "Hình ảnh", type: "image" },
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
      for (const id of ids) await exec("UPDATE products SET colors = REPLACE(colors, ?, ',') WHERE colors LIKE ?", [`,${id},`, `%,${id},%`]);
    },
  },
};
