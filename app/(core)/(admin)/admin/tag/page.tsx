import type { Metadata } from "next";
import { ListView } from "@/components/admin/list-view";
import { loadList } from "@/lib/pages";
import { ensureTagRows } from "@/lib/modules/defs/tag";

export const metadata: Metadata = { title: "Tag" };

export default async function TagListPage({ searchParams }: PageProps<"/admin/tag">) {
  await ensureTagRows();
  const data = await loadList("tag", await searchParams);
  return (
    <ListView
      module={data.module}
      rows={JSON.parse(JSON.stringify(data.rows))}
      total={data.total}
      page={data.page}
      pages={data.pages}
      pageSize={data.pageSize}
    />
  );
}
