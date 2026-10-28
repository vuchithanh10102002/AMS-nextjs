import { db } from "@/lib/db";
import { orderStatus } from "@/lib/order-status";
import type { ModuleDef } from "../types";

export const cart: ModuleDef = {
  key: "cart",
  title: "Đơn hàng",
  table: "order_bills",
  adds: false,
  list: {
    pageSize: 20,
    order: [{ id: "desc" }],
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
    customers: async () =>
      (await db.customers.findMany({ select: { id: true, fullname: true, username: true, phone: true }, orderBy: { id: "desc" } })).map((c) => ({
        value: String(c.id),
        label: `${c.fullname || (c.username ?? `#${c.id}`)} – ${c.phone ?? ""}`.trim(),
      })),
  },
  hooks: {
    decorate: (rows) => {
      for (const r of rows) r._code = `#${r.id}`;
    },
    afterDelete: async (ids) => {
      await db.orders.deleteMany({ where: { bill_id: { in: ids } } });
    },
  },
};
