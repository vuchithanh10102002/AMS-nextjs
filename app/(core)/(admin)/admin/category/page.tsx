import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ListView } from "@/components/admin/list-view";
import { getModule } from "@/lib/modules/registry";
import { toClient } from "@/lib/modules/client";
import { categoryTreeRows } from "@/lib/modules/defs/category";
import { can } from "@/lib/perm";
import { requireAdmin } from "@/lib/session";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = { title: "Mục lục" };

export default async function CategoryListPage({ searchParams }: PageProps<"/admin/category">) {
  const def = getModule("category")!;
  const admin = await requireAdmin();
  if (!can(admin, "category", "list")) redirect("/admin?denied=1");
  const sp = await searchParams;
  const params = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const [rows, module] = await Promise.all([categoryTreeRows(params), toClient(def, admin)]);
  return (
    <ListView
      module={module}
      rows={JSON.parse(JSON.stringify(rows))}
      total={rows.length}
      page={1}
      pages={1}
      pageSize={Math.max(rows.length, 1)}
      siteUrl={siteUrl()}
    />
  );
}
