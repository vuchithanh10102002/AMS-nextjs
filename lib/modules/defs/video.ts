import type { ModuleDef } from "../types";

export const video: ModuleDef = {
  key: "video",
  title: "Video",
  table: "videos",
  positions: true,
  statusToggle: true,
  list: {
    pageSize: 12,
    order: [{ pos: "desc" }, { id: "desc" }],
    filters: [
      { kind: "search", name: "s", label: "Nhập video cần tìm kiếm...", columns: ["title"] },
    ],
    columns: [
      { name: "image", label: "Ảnh", kind: "image" },
      { name: "title", label: "Tên video", link: true },
      { name: "pos", label: "Vị trí", kind: "pos" },
      { name: "status", label: "Trạng thái", kind: "toggle" },
    ],
  },
  form: {
    fields: [
      { name: "title", label: "Tên video", type: "text", required: true },
      { name: "image", label: "Ảnh video", type: "image", required: true },
      {
        name: "video",
        label: "Link iframe video",
        type: "text",
        required: true,
        placeholder: "https://www.youtube.com/embed/...",
      },
    ],
  },
  hooks: {
    beforeSave: ({ main }, ctx) => {
      if (typeof main.image === "string" && main.image.startsWith("/app/webroot/"))
        main.image = main.image.slice(1);
      if (ctx.isNew) {
        main.admin_id = ctx.admin.id;
        main.status = 1;
        main.pos = 0;
      }
    },
  },
};
