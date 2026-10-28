import { db } from "@/lib/db";
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
    order: [{ id: "desc" }],
    filters: [
      {
        kind: "search",
        name: "s",
        label: "Tìm theo tên, email, SĐT",
        columns: ["fullname", "email", "phone", "username"],
      },
      {
        kind: "select",
        name: "level",
        label: "Hạng",
        column: "level",
        options: customerLevels.filter((l) => l.value),
      },
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
      {
        name: "level",
        label: "Hạng thành viên",
        type: "select",
        required: true,
        options: customerLevels.map((l) => ({ ...l, value: l.value || "_" })),
        half: true,
      },
      { name: "status", label: "Hoạt động", type: "switch", help: "Tắt để khoá tài khoản" },
      {
        name: "_bills",
        label: "Đơn hàng của khách",
        type: "custom",
        component: "customer-orders",
        tab: "Đơn hàng",
      },
      {
        name: "_wishlist",
        label: "Sản phẩm yêu thích",
        type: "custom",
        component: "customer-wishlist",
        tab: "Yêu thích",
      },
    ],
  },
  hooks: {
    decorate: async (rows) => {
      const ids = rows.map((r) => Number(r.id));
      const counts = ids.length
        ? await db.order_bills.groupBy({
            by: ["customer_id"],
            where: { customer_id: { in: ids } },
            _count: { _all: true },
          })
        : [];
      const map = new Map(counts.map((c) => [Number(c.customer_id), c._count._all]));
      for (const r of rows) r._orders = map.get(Number(r.id)) ?? 0;
    },
    load: async (row) => {
      row.level = row.level || "_";
      row._created = Number(row.created)
        ? new Date(Number(row.created) * 1000).toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
          })
        : "—";
      row._bills = await db.order_bills.findMany({
        where: { customer_id: row.id },
        select: {
          id: true,
          nguoi_nhan: true,
          dienthoai_nhan: true,
          cart_sum: true,
          coupon_discount: true,
          paid_cart: true,
          status: true,
          created: true,
        },
        orderBy: { id: "desc" },
      });
      const wishlist = await db.wishlists.findMany({
        where: { customer_id: row.id },
        select: {
          id: true,
          product_node_id: true,
          created: true,
          title: true,
          image: true,
          price: true,
          node: {
            select: {
              title: true,
              slug: true,
              type: true,
              products: { select: { image: true, price: true }, orderBy: { id: "asc" }, take: 1 },
            },
          },
        },
        orderBy: { id: "desc" },
      });
      row._wishlist = wishlist.map(({ node, ...w }) => {
        const p = node?.products[0];
        return {
          id: w.id,
          product_node_id: w.product_node_id,
          created: w.created,
          title: node?.title ?? w.title,
          slug: node?.slug ?? null,
          type: node?.type ?? null,
          image: p?.image || w.image,
          price: p?.price ?? w.price,
        };
      });
      return row;
    },
    beforeSave: ({ main }) => {
      if (main.level === "_") main.level = null;
    },
    afterDelete: async (ids) => {
      await db.wishlists.deleteMany({ where: { customer_id: { in: ids } } });
    },
  },
};
