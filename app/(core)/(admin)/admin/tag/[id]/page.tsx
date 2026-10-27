import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecordForm } from "@/components/admin/record-form";
import { first } from "@/lib/db";
import { loadRecord } from "@/lib/pages";
import { ensureTagRows } from "@/lib/modules/defs/tag";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = { title: "Sửa tag" };

export default async function TagEditPage({ params }: PageProps<"/admin/tag/[id]">) {
  const { id } = await params;
  if (!(await first("SELECT id FROM nodes WHERE id = ? AND type = 'tag'", [Number(id) || 0]))) notFound();
  await ensureTagRows();
  const data = await loadRecord("tag", id);
  const slug = (data.values as Record<string, unknown>).slug;
  return <RecordForm module={data.module} id={data.id} values={data.values} preview={slug ? `${siteUrl()}tags/${slug}.html` : undefined} />;
}
