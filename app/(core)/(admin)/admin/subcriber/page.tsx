import type { Metadata } from "next";
import { Download } from "lucide-react";
import { ListView } from "@/components/admin/list-view";
import { Button } from "@/components/ui/button";
import { loadList } from "@/lib/pages";

export const metadata: Metadata = { title: "Đăng ký nhận tin" };

export default async function SubcriberListPage({ searchParams }: PageProps<"/admin/subcriber">) {
  const sp = await searchParams;
  const data = await loadList("subcriber", sp);
  const q = new URLSearchParams();
  for (const k of ["s", "created_from", "created_to"]) {
    const v = sp[k];
    if (typeof v === "string" && v) q.set(k, v);
  }
  return (
    <ListView
      module={data.module}
      rows={JSON.parse(JSON.stringify(data.rows))}
      total={data.total}
      page={data.page}
      pages={data.pages}
      pageSize={data.pageSize}
      siteUrl={data.siteUrl}
      extraActions={
        <Button variant="outline" nativeButton={false} render={<a href={`/admin/subcriber/export${q.size ? `?${q}` : ""}`} />}>
          <Download /> Xuất CSV
        </Button>
      }
    />
  );
}
