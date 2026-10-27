import type { ModuleDef, Option } from "../types";

const bans: Option[] = [
  { value: "0", label: "Ban lãnh đạo" },
  { value: "1", label: "Ban kiểm soát" },
  { value: "2", label: "Hội đồng quản trị" },
];

export const team: ModuleDef = {
  key: "team",
  title: "Đội ngũ",
  table: "teams",
  positions: true,
  statusToggle: true,
  list: {
    pageSize: 12,
    order: "m.pos DESC, m.id DESC",
    filters: [{ kind: "search", name: "s", label: "Tìm theo tên", columns: ["fullname"] }],
    columns: [
      { name: "image", label: "Hình ảnh", kind: "image" },
      { name: "fullname", label: "Tên", link: true },
      { name: "_bans", label: "Ban" },
      { name: "pos", label: "Vị trí", kind: "pos" },
      { name: "status", label: "Trạng thái", kind: "toggle" },
    ],
  },
  form: {
    fields: [
      { name: "fullname", label: "Tên", type: "text", required: true },
      { name: "description", label: "Vị trí", type: "text", required: true },
      { name: "content", label: "Trình độ", type: "text", required: true },
      { name: "team_position", label: "Ban", type: "multiselect", required: true, options: bans },
      { name: "image", label: "Hình ảnh", type: "image", required: true },
    ],
  },
  hooks: {
    beforeSave: ({ main }, ctx) => {
      if (main.team_position !== undefined) {
        const vals = String(main.team_position).split(",").filter((v) => bans.some((b) => b.value === v));
        if (!vals.length) throw new Error("Vui lòng chọn Ban");
        main.team_position = vals.join(",");
      }
      if (ctx.isNew) {
        main.pos = 1;
        main.status = 1;
      }
    },
    decorate: (rows) => {
      for (const r of rows)
        r._bans = String(r.team_position ?? "")
          .split(",")
          .map((v) => bans.find((b) => b.value === v.trim())?.label)
          .filter(Boolean)
          .join(", ");
    },
  },
};
