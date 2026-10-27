import "server-only";
import { cache } from "react";
import { first, query } from "./db";

export const getSettings = cache(async () => {
  const rows = await query<{ name: string; value: string | null }>("SELECT name, value FROM settings");
  return Object.fromEntries(rows.map((r) => [r.name, r.value ?? ""])) as Record<string, string>;
});

export const getBadges = cache(async () => {
  const [orders, contacts] = await Promise.all([
    first<{ n: number }>("SELECT COUNT(*) n FROM order_bills WHERE status = 0"),
    first<{ n: number }>("SELECT COUNT(*) n FROM contacts WHERE status = 0"),
  ]);
  return { orders: orders?.n ?? 0, contacts: contacts?.n ?? 0 };
});

export function siteUrl() {
  return (process.env.SITE_URL ?? "/").replace(/\/?$/, "/");
}

export function mediaUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return siteUrl() + path.replace(/^\/+/, "");
}
