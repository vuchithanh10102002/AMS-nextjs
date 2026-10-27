import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/category/category-form";
import { loadRecord } from "@/lib/pages";

export const metadata: Metadata = { title: "Thêm mục lục" };

export default async function CategoryAddPage({ searchParams }: PageProps<"/admin/category/add">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const data = await loadRecord("category", null);
  return <CategoryForm module={data.module} id={null} values={{ parent_id: one(sp.parent_id), ctype: one(sp.ctype) }} />;
}
