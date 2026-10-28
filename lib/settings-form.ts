import "server-only";
import { db } from "./db";

export type SettingItem = {
  name: string;
  label: string;
  type: "text" | "textarea" | "file" | "editor" | "select" | "password";
  value: string;
  maxlength: number;
  options?: { value: string; label: string }[];
  help?: string;
};

export type SettingGroup = { title: string; items: SettingItem[] };

export const THEME_GROUPS = Array.from({ length: 13 }, (_, i) => `s${i + 1}`);
export const THEME_KEYS = [
  { key: "background", label: "Nền" },
  { key: "background_2", label: "Nền 2" },
  { key: "text", label: "Chữ" },
  { key: "link", label: "Link" },
  { key: "hover", label: "Hover" },
];

const EXTRA: { title: string; items: Omit<SettingItem, "value" | "maxlength">[] }[] = [
  {
    title: "Email SMTP",
    items: [
      { name: "smtp_host", label: "SMTP Host", type: "text", help: "Ví dụ smtp.gmail.com" },
      { name: "smtp_port", label: "SMTP Port", type: "text", help: "465 (SSL) hoặc 587 (TLS)" },
      {
        name: "smtp_secure",
        label: "Bảo mật",
        type: "select",
        options: [
          { value: "", label: "Không" },
          { value: "ssl", label: "SSL" },
          { value: "tls", label: "TLS" },
        ],
      },
      { name: "smtp_email", label: "Tài khoản gửi (email)", type: "text" },
      {
        name: "smtp_pass",
        label: "Mật khẩu SMTP",
        type: "password",
        help: "Để trống nếu không đổi",
      },
    ],
  },
  {
    title: "Sau khi lưu",
    items: [
      {
        name: "continueAdd",
        label: "Sau khi tạo mới",
        type: "select",
        options: [
          { value: "add", label: "Tiếp tục tạo mới" },
          { value: "list", label: "Quay lại danh sách" },
          { value: "edit", label: "Đến trang sửa vừa tạo" },
        ],
      },
      {
        name: "continueEdit",
        label: "Sau khi sửa",
        type: "select",
        options: [
          { value: "edit", label: "Ở lại trang sửa" },
          { value: "list", label: "Quay lại danh sách" },
        ],
      },
    ],
  },
  {
    title: "Nâng cao",
    items: [
      { name: "price_range", label: "Mức giá", type: "textarea", help: "Mỗi dòng: Nhãn | min-max" },
      { name: "robots_txt", label: "Robots.txt", type: "textarea" },
      { name: "home_schema", label: "Schema trang chủ", type: "textarea" },
    ],
  },
];

type Row = {
  name: string;
  label: string | null;
  value: string | null;
  type: string | null;
  status: number;
  maxlength: number | null;
};

function itemType(t: string | null): SettingItem["type"] {
  if (t === "textarea") return "textarea";
  if (t === "file") return "file";
  if (t === "ckfinder") return "editor";
  return "text";
}

export async function loadSettingForm() {
  const rows = (await db.settings.findMany({
    select: { name: true, label: true, value: true, type: true, status: true, maxlength: true },
    orderBy: [{ pos: "desc" }, { id: "asc" }],
  })) as Row[];
  const byName = new Map(rows.map((r) => [r.name, r]));
  const extraNames = new Set(EXTRA.flatMap((g) => g.items.map((i) => i.name)));
  const general: SettingGroup = {
    title: "Thông tin chung",
    items: rows
      .filter((r) => r.status === 1 && r.name !== "theme_setting" && !extraNames.has(r.name))
      .map((r) => ({
        name: r.name,
        label: String(r.label || r.name)
          .replace(/<br\s*\/?>/gi, " ")
          .replace(/<[^>]+>/g, ""),
        type: itemType(r.type),
        value: r.value ?? "",
        maxlength: Number(r.maxlength) || 0,
      })),
  };
  const extra: SettingGroup[] = EXTRA.map((g) => ({
    title: g.title,
    items: g.items.map((i) => ({
      ...i,
      value: i.type === "password" ? "" : (byName.get(i.name)?.value ?? ""),
      maxlength: 0,
    })),
  }));
  let theme: Record<string, Record<string, string>> = {};
  try {
    theme = JSON.parse(byName.get("theme_setting")?.value || "{}");
  } catch {}
  return {
    groups: [general, ...extra],
    theme,
    hasTheme: byName.has("theme_setting"),
    hasPass: !!byName.get("smtp_pass")?.value,
  };
}

export async function allowedSettingNames() {
  const { groups } = await loadSettingForm();
  return new Map(groups.flatMap((g) => g.items.map((i) => [i.name, i] as const)));
}
