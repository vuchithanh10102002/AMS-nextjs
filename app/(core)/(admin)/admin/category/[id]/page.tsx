import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/category/category-form";
import { loadRecord } from "@/lib/pages";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = { title: "Sửa mục lục" };

export default async function CategoryEditPage({ params }: PageProps<"/admin/category/[id]">) {
  const { id } = await params;
  const data = await loadRecord("category", id);
  const v = data.values as Record<string, unknown>;
  const preview =
    v.ctype === "link"
      ? v.link
        ? String(v.link)
        : undefined
      : v.slug
        ? `${siteUrl()}${v.slug}.html`
        : undefined;
  return <CategoryForm module={data.module} id={data.id} values={v} preview={preview} />;
}
