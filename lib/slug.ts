import { first } from "./db";
import { slugify } from "./slug-client";

export { slugify };

export async function slugTaken(slug: string, excludeNodeId?: number | null) {
  const row = await first("SELECT id FROM nodes WHERE slug = ? AND id <> ? LIMIT 1", [slug, excludeNodeId ?? 0]);
  return !!row;
}

export async function uniqueSlug(source: string, excludeNodeId?: number | null) {
  const base = slugify(source) || "n";
  if (!(await slugTaken(base, excludeNodeId))) return base;
  return `${base}-${Math.floor(Date.now() / 1000)}`;
}
