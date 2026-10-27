import { exec } from "@/lib/db";
import type { ModuleDef } from "../types";

export const news: ModuleDef = {
  key: "news",
  title: "Bài viết",
  table: "news",
  node: "news",
  positions: true,
  statusToggle: true,
  copies: true,
  previewLink: true,
  scope: (admin) => (admin.id === 1 ? null : { where: "m.admin_id = ?", params: [admin.id] }),
  list: {
    pageSize: 10,
    order: "n.pos DESC, m.featured DESC, n.created DESC, n.id DESC",
    filters: [
      { kind: "search", name: "s", label: "Tìm theo tiêu đề", columns: ["title"] },
      { kind: "category", name: "list_category", label: "Danh mục", ctype: "news" },
      { kind: "select", name: "filter_status", label: "Trạng thái", column: "status", options: [{ value: "1", label: "Xuất bản" }, { value: "0", label: "Tạm lưu" }] },
    ],
    toggles: ["featured"],
    columns: [
      { name: "image", label: "Hình ảnh", kind: "image" },
      { name: "title", label: "Tiêu đề", link: true },
      { name: "_categories", label: "Mục lục", kind: "categories" },
      { name: "created", label: "Ngày", kind: "unix" },
      { name: "pos", label: "Vị trí", kind: "pos" },
      { name: "featured", label: "Nổi bật", kind: "toggle" },
      { name: "status", label: "Trạng thái", kind: "toggle" },
    ],
  },
  form: {
    fields: [
      { name: "title", label: "Tiêu đề", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", only: "edit", required: true },
      { name: "category_id", label: "Mục lục", type: "categories", ctype: "news", required: true },
      { name: "status", label: "Trạng thái", type: "select", default: 1, half: true, options: [{ value: "1", label: "Xuất bản" }, { value: "0", label: "Tạm lưu" }] },
      { name: "created", label: "Ngày", type: "date", storage: "unix", half: true },
      { name: "image", label: "Ảnh đại diện", type: "image", required: true },
      { name: "description", label: "Mô tả", type: "editor", height: 300 },
      { name: "content", label: "Nội dung", type: "editor", height: 500 },
      { name: "seo_title", label: "SEO Title", type: "text", tab: "SEO" },
      { name: "seo_keyword", label: "SEO Keywords", type: "text", maxLength: 120, tab: "SEO" },
      { name: "seo_description", label: "SEO Description", type: "textarea", rows: 2, maxLength: 160, tab: "SEO" },
    ],
  },
  hooks: {
    beforeSave: ({ main }, ctx) => {
      if (ctx.isNew) main.admin_id = ctx.admin.id;
    },
    afterDelete: async (ids) => {
      await exec("DELETE FROM tags WHERE node_id IN (?)", [ids]);
    },
  },
};
