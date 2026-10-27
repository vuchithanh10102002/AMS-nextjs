import type { ModuleDef } from "../types";

export const faq: ModuleDef = {
  key: "faq",
  title: "Câu hỏi thường gặp",
  table: "faqs",
  positions: true,
  statusToggle: true,
  list: {
    pageSize: 10,
    order: "m.pos DESC, m.id DESC",
    filters: [{ kind: "search", name: "s", label: "Nhập FAQ cần tìm kiếm...", columns: ["title"] }],
    columns: [
      { name: "title", label: "Câu hỏi", link: true },
      { name: "pos", label: "Vị trí", kind: "pos" },
      { name: "status", label: "Trạng thái", kind: "toggle" },
    ],
  },
  form: {
    tabs: ["Tiếng Việt", "English"],
    fields: [
      { name: "title", label: "Câu hỏi", type: "text", required: true, tab: "Tiếng Việt" },
      { name: "description", label: "Tóm tắt", type: "textarea", rows: 3, tab: "Tiếng Việt" },
      { name: "content", label: "Nội dung", type: "editor", height: 240, tab: "Tiếng Việt" },
      { name: "title_en", label: "Câu hỏi (EN)", type: "text", tab: "English" },
      { name: "description_en", label: "Tóm tắt (EN)", type: "textarea", rows: 3, tab: "English" },
      { name: "content_en", label: "Nội dung (EN)", type: "editor", height: 240, tab: "English" },
    ],
  },
  hooks: {
    beforeSave: ({ main }, ctx) => {
      const now = Math.floor(Date.now() / 1000);
      main.modified = now;
      if (ctx.isNew) {
        for (const k of ["title_en", "description_en", "content_en"]) main[k] ??= "";
        main.created = now;
        main.status = 1;
        main.pos = 1;
      }
    },
  },
};
