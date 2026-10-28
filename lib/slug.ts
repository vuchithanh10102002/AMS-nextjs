import { db } from "./db";
import { slugify } from "./slug-client";

export { slugify };

export async function slugTaken(slug: string, excludeNodeId?: number | null) {
  const row = await db.nodes.findFirst({
    where: { slug, id: { not: excludeNodeId ?? 0 } },
    select: { id: true },
  });
  return !!row;
}

export async function uniqueSlug(source: string, excludeNodeId?: number | null) {
  const base = slugify(source) || "n";
  if (!(await slugTaken(base, excludeNodeId))) return base;
  return `${base}-${Math.floor(Date.now() / 1000)}`;
}
