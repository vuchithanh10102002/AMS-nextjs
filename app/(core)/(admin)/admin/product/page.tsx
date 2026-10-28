import type { Metadata } from "next";
import { ListView } from "@/components/admin/list-view";
import { ProductOrphans } from "@/components/admin/product/orphans";
import { db } from "@/lib/db";
import { loadList } from "@/lib/pages";

export const metadata: Metadata = { title: "Sản phẩm" };

export default async function ProductListPage({ searchParams }: PageProps<"/admin/product">) {
  const data = await loadList("product", await searchParams);
  const [nodes, products] = await Promise.all([
    db.nodes.findMany({ where: { type: "product", products: { none: {} } }, select: { id: true, title: true, slug: true, created: true }, orderBy: { id: "asc" } }),
    db.products.findMany({
      where: { OR: [{ node_id: null }, { node: { is: null } }, { node: { is: { NOT: { type: "product" } } } }] },
      select: { id: true, node_id: true, price: true },
      orderBy: { id: "asc" },
    }) as Promise<{ id: number; node_id: number | null; price: number | null }[]>,
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
