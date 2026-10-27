import type { Metadata } from "next";
import { ListView } from "@/components/admin/list-view";
import { loadList } from "@/lib/pages";

export const metadata: Metadata = { title: "Đơn hàng" };

export default async function CartListPage({ searchParams }: PageProps<"/admin/cart">) {
  const data = await loadList("cart", await searchParams);
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
