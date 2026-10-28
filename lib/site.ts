import "server-only";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";

export async function getSettings() {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const rows = await db.settings.findMany({ select: { name: true, value: true } });
  return Object.fromEntries(rows.map((r) => [r.name, r.value ?? ""])) as Record<string, string>;
}

export const getBadges = cache(async () => {
  const [orders, contacts] = await Promise.all([
    db.order_bills.count({ where: { status: 0 } }),
    db.contacts.count({ where: { status: 0 } }),
  ]);
  return { orders, contacts };
});

export function siteUrl() {
  return (process.env.SITE_URL ?? "/").replace(/\/?$/, "/");
}

export function mediaUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return siteUrl() + path.replace(/^\/+/, "");
}
