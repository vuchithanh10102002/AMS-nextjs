import type { ModuleDef, Option } from "../types";

const baseTypes: Record<string, string> = {
  slideshow: "Slideshow",
  banner_hang: "Banner thương hiệu",
  banner_home: "Banner trang chủ",
};

export const callback_banner_types: Record<string, string> = { chung_chi: "Chứng chỉ" };

export const bannerTypes: Option[] = Object.entries({ ...baseTypes, ...callback_banner_types }).flatMap(([value, label]) => [
  { value, label },
  { value: `${value}_m`, label: `${label} Mobile` },
]);

export const banner: ModuleDef = {
  key: "banner",
  title: "Banner",
  table: "banners",
  positions: true,
  statusToggle: true,
  list: {
    pageSize: 10,
    order: [{ pos: "desc" }, { id: "desc" }],
    filters: [
      { kind: "search", name: "s", label: "Tìm theo tiêu đề", columns: ["title"] },
      { kind: "select", name: "t", label: "Loại banner", column: "type", options: bannerTypes },
    ],
    columns: [
      { name: "image", label: "Hình ảnh", kind: "image" },
      { name: "title", label: "Tiêu đề", link: true },
      { name: "type", label: "Dạng", kind: "badge", options: bannerTypes },
      { name: "pos", label: "Vị trí", kind: "pos" },
      { name: "status", label: "Trạng thái", kind: "toggle" },
    ],
  },
  form: {
    fields: [
      { name: "title", label: "Tiêu đề", type: "text", required: true },
      { name: "link", label: "Link", type: "text" },
      { name: "image", label: "Hình ảnh", type: "image", required: true },
      { name: "type", label: "Loại banner", type: "select", required: true, options: bannerTypes },
      { name: "description", label: "Mô tả", type: "text" },
    ],
  },
  hooks: {
    beforeSave: ({ main }, ctx) => {
      if (main.type !== undefined && !bannerTypes.some((o) => o.value === main.type)) throw new Error("Loại banner không hợp lệ");
      if (ctx.isNew) {
        main.link ||= "#";
        main.category_id = 0;
        main.pos = 1;
        main.status = 1;
      }
    },
  },
};
