import { first } from "@/lib/db";
import type { ModuleDef } from "../types";

export const coupon: ModuleDef = {
  key: "coupon",
  title: "Coupon",
  table: "coupons",
  statusToggle: true,
  list: {
    pageSize: 50,
    order: "m.id DESC",
    filters: [
      { kind: "search", name: "s", label: "Tìm theo tên hoặc mã", columns: ["title", "code"] },
      { kind: "select", name: "status", label: "Trạng thái", column: "status", options: [{ value: "1", label: "Đang bật" }, { value: "0", label: "Đang tắt" }] },
    ],
    columns: [
      { name: "title", label: "Tên coupon", link: true },
      { name: "code", label: "Mã" },
      { name: "price", label: "Giảm theo giá trị", kind: "money" },
      { name: "percent", label: "Giảm theo %", kind: "number" },
      { name: "for_sum", label: "Áp dụng cho đơn từ", kind: "money" },
      { name: "expired", label: "Hạn sử dụng", kind: "unix" },
      { name: "status", label: "Trạng thái", kind: "toggle" },
    ],
  },
  form: {
    fields: [
      { name: "title", label: "Tên coupon", type: "text", required: true },
      { name: "code", label: "Mã coupon", type: "text", required: true, half: true },
      { name: "status", label: "Kích hoạt", type: "switch", default: 1, half: true },
      { name: "percent", label: "Giảm theo phần trăm", type: "number", placeholder: "Ví dụ: 5", half: true, help: "0 – 100" },
      { name: "price", label: "Giảm theo số tiền", type: "money", half: true, help: "Dùng khi không giảm theo %" },
      { name: "for_sum", label: "Áp dụng cho đơn giá trị từ", type: "money", required: true, placeholder: "Ví dụ: 500000", half: true },
      { name: "expired", label: "Hạn sử dụng", type: "date", storage: "unix", required: true, half: true },
      { name: "description", label: "Mô tả", type: "textarea", rows: 3 },
    ],
  },
  hooks: {
    beforeSave: async ({ main }, ctx) => {
      main.code = String(main.code ?? "").trim();
      const percent = Number(main.percent ?? 0);
      if (!Number.isInteger(percent) || percent < 0 || percent > 100) throw new Error("Giảm theo phần trăm phải từ 0 đến 100");
      main.percent = percent;
      if (Number(main.price ?? 0) < 0) throw new Error("Số tiền giảm không hợp lệ");
      if (await first("SELECT id FROM coupons WHERE code = ? AND id <> ?", [main.code, ctx.id ?? 0])) throw new Error("Mã coupon đã tồn tại");
      if (ctx.isNew) main.created = Math.floor(Date.now() / 1000);
    },
  },
};
