import { exec } from "@/lib/db";
import type { ModuleDef } from "../types";

export const mien: ModuleDef = {
  key: "mien",
  title: "Miền",
  table: "miens",
  list: {
    pageSize: 15,
    order: "m.id ASC",
    filters: [{ kind: "search", name: "s", label: "Tìm theo tên", columns: ["title", "title_en"] }],
    columns: [
      { name: "title", label: "Tên", link: true },
      { name: "title_en", label: "Tên (EN)" },
    ],
  },
  form: {
    fields: [
      { name: "title", label: "Miền", type: "text", required: true, maxLength: 64 },
      { name: "title_en", label: "Miền (EN)", type: "text", maxLength: 64 },
    ],
  },
  hooks: {
    afterDelete: async (ids) => {
      await exec("UPDATE cities SET mien_id = NULL WHERE mien_id IN (?)", [ids]);
    },
  },
};
