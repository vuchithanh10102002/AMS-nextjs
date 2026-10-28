import type { ModuleDef } from "../types";

export const subcriber: ModuleDef = {
  key: "subcriber",
  title: "Đăng ký nhận tin",
  table: "subcribers",
  adds: false,
  edits: false,
  list: {
    pageSize: 15,
    order: [{ id: "desc" }],
    filters: [
      { kind: "search", name: "s", label: "Tìm theo email", columns: ["email"] },
      { kind: "daterange", name: "created", label: "Ngày đăng ký", column: "created", unix: true },
    ],
    columns: [
      { name: "email", label: "Email" },
      { name: "created", label: "Ngày đăng ký", kind: "datetime" },
    ],
  },
};
