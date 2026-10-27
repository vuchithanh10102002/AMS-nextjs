import type { ModuleDef } from "../types";

export const contactStatus = [
  { value: "0", label: "Chưa xử lý" },
  { value: "1", label: "Đã xử lý" },
];

export const contact: ModuleDef = {
  key: "contact",
  title: "Liên hệ",
  table: "contacts",
  adds: false,
  statusToggle: true,
  list: {
    pageSize: 12,
    order: "m.status ASC, m.id DESC",
    filters: [
      { kind: "search", name: "s", label: "Tìm theo tên, email, SĐT, nội dung", columns: ["fullname", "email", "phone", "title", "content"] },
      { kind: "select", name: "status", label: "Trạng thái", column: "status", options: contactStatus },
    ],
    columns: [
      { name: "title", label: "Tiêu đề", link: true },
      { name: "fullname", label: "Họ tên", link: true },
      { name: "email", label: "Email" },
      { name: "phone", label: "Điện thoại" },
      { name: "content", label: "Nội dung", kind: "html" },
      { name: "created", label: "Ngày gửi", kind: "datetime" },
      { name: "status", label: "Đã xử lý", kind: "toggle" },
    ],
  },
  form: {
    fields: [
      { name: "title", label: "Tiêu đề", type: "readonly" },
      { name: "fullname", label: "Họ tên", type: "readonly", half: true },
      { name: "_created", label: "Ngày gửi", type: "readonly", half: true },
      { name: "email", label: "Email", type: "readonly", half: true },
      { name: "phone", label: "Điện thoại", type: "readonly", half: true },
      { name: "address", label: "Địa chỉ", type: "readonly" },
      { name: "content", label: "Nội dung", type: "custom", component: "contact-content" },
      { name: "status", label: "Đã xử lý", type: "switch" },
    ],
  },
  hooks: {
    load: (row) => {
      const n = Number(row.created);
      const d = /^\d+$/.test(String(row.created ?? "")) && n > 1e9 ? new Date(n * 1000) : null;
      row._created = d ? d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : String(row.created ?? "");
      return row;
    },
  },
};
