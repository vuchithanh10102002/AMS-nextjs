"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { uniqueSlug } from "@/lib/slug";

export async function titleExists(title: string, excludeNodeId?: number | null, type?: string) {
  await requireAdmin();
  const t = title.trim();
  if (t.length < 4) return false;
  const row = await db.nodes.findFirst({ where: { title: t, id: { not: excludeNodeId ?? 0 }, ...(type ? { type } : {}) }, select: { id: true } });
  return !!row;
}

export async function suggestSlug(text: string, excludeNodeId?: number | null) {
  await requireAdmin();
  return uniqueSlug(text, excludeNodeId);
}
