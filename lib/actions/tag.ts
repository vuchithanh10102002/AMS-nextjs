"use server";

import { requireAdmin } from "@/lib/session";
import { searchTags } from "@/lib/modules/defs/tag";

export async function suggestTags(q: string) {
  await requireAdmin();
  return (await searchTags(q)).map((t) => String(t.title ?? "").trim()).filter(Boolean);
}
