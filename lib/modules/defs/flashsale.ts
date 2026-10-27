import { exec } from "@/lib/db";
import type { ModuleDef } from "../types";

export const flashsale: ModuleDef = {
  key: "flashsale",
  title: "Chương trình ưu đãi",
  table: "flashsales",
  positions: true,
  statusToggle: true,
  list: {
    pageSize: 12,
    order: "m.pos DESC, m.id DESC",
    filters: [{ kind: "search", name: "s", label: "Tìm theo tên", columns: ["title"] }],
    columns: [
      { name: "image", label: "Hình ảnh", kind: "image" },
      { name: "title", label: "Tiêu đề", link: true },
      { name: "price_percent", label: "Giảm (%)", kind: "number" },
      { name: "expired", label: "Hết hạn", kind: "unix" },
      { name: "pos", label: "Vị trí", kind: "pos" },
      { name: "status", label: "Trạng thái", kind: "toggle" },
    ],
  },
  form: {
    fields: [
      { name: "title", label: "Chương trình ưu đãi", type: "text", required: true },
      { name: "expired", label: "Ngày hết hạn", type: "date", storage: "unix", half: true, help: "Hết hạn lúc 23:59:59 của ngày đã chọn" },
      { name: "price_percent", label: "Giảm giá (%)", type: "number", half: true },
      { name: "status", label: "Hiển thị", type: "switch", default: 1 },
      { name: "image", label: "Hình ảnh", type: "image" },
      { name: "description", label: "Mô tả", type: "editor", height: 300 },
    ],
  },
  hooks: {
    beforeSave: ({ main }, ctx) => {
      if (main.expired) main.expired = Number(main.expired) + 86399;
      const pct = Number(main.price_percent ?? 0);
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) throw new Error("Giảm giá phải từ 0 đến 100%");
      main.price_percent = Math.round(pct);
      if (ctx.isNew) {
        main.created = Math.floor(Date.now() / 1000);
        main.pos ??= 1;
      }
    },
    afterDelete: async (ids) => {
      await exec("UPDATE products SET flashsale_id = NULL WHERE flashsale_id IN (?)", [ids]);
    },
  },
};
