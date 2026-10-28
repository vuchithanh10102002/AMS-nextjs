import { db } from "@/lib/db";
import type { ModuleDef, Option } from "../types";

export const PERM_ACTS = ["list", "add", "edit", "delete"] as const;

const EXTRA_PERMS: { key: string; title: string }[] = [
  { key: "lang", title: "Khoá giao diện (lang)" },
  { key: "account", title: "Tài khoản quản trị" },
];

export async function permOptions(): Promise<Option[]> {
  const [{ menu }, { allModules }] = await Promise.all([
    import("@/lib/menu"),
    import("../registry"),
  ]);
  const seen = new Set<string>();
  const out: Option[] = [];
  for (const g of menu)
    for (const i of g.items) {
      const key = i.url.split("/").pop()!;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ value: key, label: `${g.title}|${i.title}` });
    }
  for (const m of allModules()) {
    const key = m.perm ?? m.key;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ value: key, label: `Module khác|${m.title}` });
  }
  for (const e of EXTRA_PERMS)
    if (!seen.has(e.key)) {
      seen.add(e.key);
      out.push({ value: e.key, label: `Hệ thống|${e.title}` });
    }
  return out;
}

function csv(v: unknown) {
  return String(v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const account: ModuleDef = {
  key: "account",
  title: "Tài khoản quản trị",
  table: "admins",
  statusToggle: true,
  scope: (admin) => ({ AND: [{ id: { not: 1 } }, { id: { not: admin.id } }] }),
  list: {
    pageSize: 20,
    order: [{ id: "desc" }],
    filters: [
      {
        kind: "search",
        name: "s",
        label: "Tên đăng nhập, họ tên, email...",
        columns: ["username", "fullname", "email", "phone"],
      },
      {
        kind: "select",
        name: "status",
        label: "Trạng thái",
        column: "status",
        options: [
          { value: "1", label: "Hoạt động" },
          { value: "0", label: "Khoá" },
        ],
      },
    ],
    columns: [
      { name: "username", label: "Tên đăng nhập", link: true },
      { name: "fullname", label: "Họ tên" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Điện thoại" },
      { name: "last_logged", label: "Đăng nhập cuối", kind: "datetime" },
      { name: "status", label: "Hoạt động", kind: "toggle" },
    ],
  },
  form: {
    tabs: ["Thông tin chung", "Phân quyền"],
    fields: [
      {
        name: "username",
        label: "Tên đăng nhập",
        type: "text",
        required: true,
        half: true,
        maxLength: 32,
      },
      {
        name: "password",
        label: "Mật khẩu",
        type: "password",
        required: true,
        half: true,
        help: "Khi sửa: để trống nếu không đổi",
      },
      { name: "fullname", label: "Họ tên", type: "text", half: true, maxLength: 34 },
      {
        name: "email",
        label: "Email",
        type: "text",
        half: true,
        maxLength: 64,
        help: "Dùng cho chức năng quên mật khẩu",
      },
      { name: "phone", label: "Điện thoại", type: "text", half: true },
      { name: "status", label: "Hoạt động", type: "switch", half: true, default: 1 },
      { name: "image", label: "Ảnh đại diện", type: "image" },
      {
        name: "role",
        label: "Quyền theo module",
        type: "custom",
        component: "account-roles",
        optionsKey: "perms",
        tab: "Phân quyền",
      },
    ],
  },
  options: { perms: permOptions },
  hooks: {
    beforeSave: async ({ main }, ctx) => {
      if ("username" in main) {
        main.username = String(main.username).trim();
        if (!/^[A-Za-z0-9_.@-]{3,32}$/.test(main.username))
          throw new Error("Tên đăng nhập 3–32 ký tự, chỉ gồm chữ, số và . _ - @");
        const dup = await db.admins.findFirst({
          where: { username: main.username, id: { not: ctx.id ?? 0 } },
          select: { id: true },
        });
        if (dup) throw new Error("Tên đăng nhập đã tồn tại");
      }
      if (main.email) {
        main.email = String(main.email).trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(main.email)) throw new Error("Email không hợp lệ");
      }
      if (ctx.form.has("_roles")) {
        const known = new Set(
          (await permOptions()).flatMap((o) => PERM_ACTS.map((a) => `${o.value}_${a}`)),
        );
        const picked = ctx.form
          .getAll("role")
          .map(String)
          .filter((r) => known.has(r));
        const kept = csv(ctx.before?.role).filter((r) => !known.has(r));
        main.role = [...new Set([...kept, ...picked])].join(",");
      }
      if (ctx.isNew) main.status ??= 1;
    },
    afterDelete: async (ids) => {
      await db.news.updateMany({ where: { admin_id: { in: ids } }, data: { admin_id: 1 } });
    },
  },
};
