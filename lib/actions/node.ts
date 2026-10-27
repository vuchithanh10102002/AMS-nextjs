"use server";

import { first } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { uniqueSlug } from "@/lib/slug";

export async function titleExists(title: string, excludeNodeId?: number | null, type?: string) {
  await requireAdmin();
  const t = title.trim();
  if (t.length < 4) return false;
  const row = await first(
    `SELECT id FROM nodes WHERE title = ? AND id <> ?${type ? " AND type = ?" : ""} LIMIT 1`,
    [t, excludeNodeId ?? 0, ...(type ? [type] : [])],
  );
  return !!row;
}

export async function suggestSlug(text: string, excludeNodeId?: number | null) {
  await requireAdmin();
  return uniqueSlug(text, excludeNodeId);
}
