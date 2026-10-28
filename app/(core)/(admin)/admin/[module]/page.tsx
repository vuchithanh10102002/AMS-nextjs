import type { Metadata } from "next";
import { ListView } from "@/components/admin/list-view";
import { loadList } from "@/lib/pages";
import { getModule } from "@/lib/modules/registry";

export async function generateMetadata({
  params,
}: PageProps<"/admin/[module]">): Promise<Metadata> {
  const { module } = await params;
  return { title: getModule(module)?.title ?? "Quản trị" };
}

export default async function ModuleListPage({
  params,
  searchParams,
}: PageProps<"/admin/[module]">) {
  const { module: key } = await params;
  const data = await loadList(key, await searchParams);
  return (
    <ListView
      module={data.module}
      rows={JSON.parse(JSON.stringify(data.rows))}
      total={data.total}
      page={data.page}
      pages={data.pages}
      pageSize={data.pageSize}
      siteUrl={data.siteUrl}
    />
  );
}
