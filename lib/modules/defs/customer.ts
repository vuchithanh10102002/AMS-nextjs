import { exec, query } from "@/lib/db";
import type { ModuleDef } from "../types";

export const customerLevels = [
  { value: "", label: "Khách hàng" },
  { value: "member", label: "Member" },
  { value: "gold", label: "Gold" },
  { value: "vip", label: "Vip" },
];

const active = [
  { value: "1", label: "Hoạt động" },
  { value: "0", label: "Đã khoá" },
];

export const customer: ModuleDef = {
  key: "customer",
  title: "Khách hàng",
  table: "customers",
  adds: false,
  statusToggle: true,
  list: {
    pageSize: 12,
    order: "m.id DESC",
    filters: [
      { kind: "search", name: "s", label: "Tìm theo tên, email, SĐT", columns: ["fullname", "email", "phone", "username"] },
      { kind: "select", name: "level", label: "Hạng", column: "level", options: customerLevels.filter((l) => l.value) },
      { kind: "select", name: "status", label: "Trạng thái", column: "status", options: active },
    ],
    columns: [
      { name: "fullname", label: "Họ tên", link: true },
      { name: "username", label: "Tài khoản" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Số điện thoại" },
      { name: "level", label: "Hạng", kind: "badge", options: customerLevels },
      { name: "_orders", label: "Số đơn", kind: "number" },
      { name: "created", label: "Ngày đăng ký", kind: "unix" },
      { name: "status", label: "Hoạt động", kind: "toggle" },
    ],
  },
  form: {
    tabs: ["Thông tin chung", "Đơn hàng", "Yêu thích"],
    fields: [
      { name: "fullname", label: "Họ tên", type: "readonly", half: true },
      { name: "username", label: "Tài khoản", type: "readonly", half: true },
      { name: "email", label: "Email", type: "readonly", half: true },
      { name: "phone", label: "Điện thoại", type: "readonly", half: true },
      { name: "address", label: "Địa chỉ", type: "readonly" },
      { name: "_created", label: "Ngày đăng ký", type: "readonly", half: true },
      { name: "level", label: "Hạng thành viên", type: "select", required: true, options: customerLevels.map((l) => ({ ...l, value: l.value || "_" })), half: true },
      { name: "status", label: "Hoạt động", type: "switch", help: "Tắt để khoá tài khoản" },
      { name: "_bills", label: "Đơn hàng của khách", type: "custom", component: "customer-orders", tab: "Đơn hàng" },
      { name: "_wishlist", label: "Sản phẩm yêu thích", type: "custom", component: "customer-wishlist", tab: "Yêu thích" },
    ],
  },
  hooks: {
    decorate: async (rows) => {
      const ids = rows.map((r) => Number(r.id));
      const counts = ids.length ? await query<{ customer_id: number; n: number }>("SELECT customer_id, COUNT(*) n FROM order_bills WHERE customer_id IN (?) GROUP BY customer_id", [ids]) : [];
      const map = new Map(counts.map((c) => [Number(c.customer_id), c.n]));
      for (const r of rows) r._orders = map.get(Number(r.id)) ?? 0;
    },
    load: async (row) => {
      row.level = row.level || "_";
      row._created = Number(row.created) ? new Date(Number(row.created) * 1000).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "—";
      row._bills = await query("SELECT id, nguoi_nhan, dienthoai_nhan, cart_sum, coupon_discount, paid_cart, status, created FROM order_bills WHERE customer_id = ? ORDER BY id DESC", [row.id]);
      row._wishlist = await query(
        "SELECT w.id, w.product_node_id, w.created, COALESCE(n.title, w.title) title, n.slug, n.type, COALESCE(NULLIF(p.image, ''), w.image) image, COALESCE(p.price, w.price) price FROM wishlists w LEFT JOIN nodes n ON n.id = w.product_node_id LEFT JOIN products p ON p.node_id = w.product_node_id WHERE w.customer_id = ? ORDER BY w.id DESC",
        [row.id],
      );
      return row;
    },
    beforeSave: ({ main }) => {
      if (main.level === "_") main.level = null;
    },
    afterDelete: async (ids) => {
      await exec("DELETE FROM wishlists WHERE customer_id IN (?)", [ids]);
    },
  },
};
