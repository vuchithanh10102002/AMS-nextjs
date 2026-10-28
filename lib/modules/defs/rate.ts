import type { ModuleDef } from "../types";

export const rate: ModuleDef = {
  key: "rate",
  title: "Tuyển dụng",
  table: "rates",
  positions: true,
  statusToggle: true,
  list: {
    pageSize: 20,
    order: [{ pos: "desc" }, { id: "desc" }],
    filters: [{ kind: "search", name: "s", label: "Nhập từ khóa cần tìm kiếm...", columns: ["title", "fullname"] }],
    columns: [
      { name: "title", label: "Vị trí", link: true },
      { name: "fullname", label: "Phòng ban" },
      { name: "age", label: "Địa điểm" },
      { name: "address", label: "Hạn nộp" },
      { name: "pos", label: "Vị trí sắp xếp", kind: "pos" },
      { name: "status", label: "Duyệt", kind: "toggle" },
    ],
  },
  form: {
    fields: [
      { name: "title", label: "Vị trí", type: "text", required: true },
      { name: "fullname", label: "Phòng ban", type: "text", required: true },
      { name: "age", label: "Địa điểm", type: "text", required: true },
      { name: "address", label: "Hạn nộp", type: "text", required: true, placeholder: "31/03/2024" },
    ],
  },
  hooks: {
    beforeSave: ({ main }, ctx) => {
      if (ctx.isNew) {
        for (const k of ["title_en", "fullname_en", "age_en", "address_en", "nghenghiep_en", "show_in"]) main[k] = "";
        main.admin_id = ctx.admin.id;
        main.created = Math.floor(Date.now() / 1000);
        main.status = 0;
        main.pos = 0;
      }
    },
  },
};
