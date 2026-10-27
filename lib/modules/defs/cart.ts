import { distinctOptions } from "@/lib/crud";
import { exec } from "@/lib/db";
import { orderStatus } from "@/lib/order-status";
import type { ModuleDef } from "../types";

export const cart: ModuleDef = {
  key: "cart",
  title: "Đơn hàng",
  table: "order_bills",
  adds: false,
  list: {
    pageSize: 20,
    order: "m.id DESC",
    filters: [
      { kind: "search", name: "s", label: "Tên, SĐT, email, địa chỉ người đặt", columns: ["nguoi_nhan", "dienthoai_nhan", "email_nhan", "diachi_nhan"] },
      { kind: "select", name: "status", label: "Trạng thái", column: "status", options: orderStatus },
      { kind: "select", name: "uid", label: "Khách hàng", column: "customer_id", optionsKey: "customers" },
      { kind: "daterange", name: "created", label: "Ngày đặt", column: "created", unix: true },
    ],
    columns: [
      { name: "_code", label: "Mã đơn", link: true },
      { name: "nguoi_nhan", label: "Người đặt", link: true },
      { name: "dienthoai_nhan", label: "Điện thoại" },
      { name: "email_nhan", label: "Email" },
      { name: "content", label: "Ghi chú", kind: "html" },
      { name: "cart_sum", label: "Tạm tính", kind: "money" },
      { name: "paid_cart", label: "Thanh toán", kind: "money" },
      { name: "created", label: "Ngày đặt", kind: "datetime" },
      { name: "status", label: "Trạng thái", kind: "badge", options: orderStatus },
    ],
  },
  options: {
    customers: () =>
      distinctOptions("SELECT id value, CONCAT(COALESCE(NULLIF(fullname, ''), username, CONCAT('#', id)), ' – ', COALESCE(phone, '')) label FROM customers ORDER BY id DESC"),
  },
  hooks: {
    decorate: (rows) => {
      for (const r of rows) r._code = `#${r.id}`;
    },
    afterDelete: async (ids) => {
      await exec("DELETE FROM orders WHERE bill_id IN (?)", [ids]);
    },
  },
};
