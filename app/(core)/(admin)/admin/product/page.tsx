import type { Metadata } from "next";
import { ListView } from "@/components/admin/list-view";
import { ProductOrphans } from "@/components/admin/product/orphans";
import { query } from "@/lib/db";
import { loadList } from "@/lib/pages";

export const metadata: Metadata = { title: "Sản phẩm" };

export default async function ProductListPage({ searchParams }: PageProps<"/admin/product">) {
  const data = await loadList("product", await searchParams);
  const [nodes, products] = await Promise.all([
    query<{ id: number; title: string | null; slug: string | null; created: number | null }>(
      "SELECT n.id, n.title, n.slug, n.created FROM nodes n LEFT JOIN products p ON p.node_id = n.id WHERE n.type = 'product' AND p.id IS NULL ORDER BY n.id",
    ),
    query<{ id: number; node_id: number | null; price: number | null }>(
      "SELECT p.id, p.node_id, p.price FROM products p LEFT JOIN nodes n ON n.id = p.node_id WHERE p.node_id IS NULL OR n.id IS NULL OR n.type <> 'product' ORDER BY p.id",
    ),
  ]);
  return (
    <>
      <ProductOrphans nodes={nodes} products={products} canAdd={data.module.can.add} canDelete={data.module.can.delete} />
      <ListView
        module={data.module}
        rows={JSON.parse(JSON.stringify(data.rows))}
        total={data.total}
        page={data.page}
        pages={data.pages}
        pageSize={data.pageSize}
        siteUrl={data.siteUrl}
      />
    </>
  );
}
