import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { Shell } from "@/site/components/layout/shell";
import { site } from "@/site/lib/ctx";
import { pageMeta } from "@/site/lib/meta";
import { countView } from "@/site/lib/queries/node";
import { resolve } from "@/site/lib/resolve";
import { link } from "@/site/lib/url";
import { NewsDetail } from "@/site/views/news/detail";
import { NewsList } from "@/site/views/news/list";
import { About } from "@/site/views/page/about";
import { Brands } from "@/site/views/page/brands";
import { PageDetail } from "@/site/views/page/detail";
import { Page404 } from "@/site/views/page/not-found";
import { ProductDetail } from "@/site/views/product/detail";
import { ProductList } from "@/site/views/product/list";

export async function generateMetadata({ params }: PageProps<"/[...slug]">): Promise<Metadata> {
  const r = await resolve((await params).slug);
  if (!r || r.kind === "redirect") return {};
  const s = await site();
  if (r.kind === "category") {
    const c = r.cur;
    return pageMeta({
      title: s.tr(c, "seo_title") || s.tr(c.node, "title"),
      description: s.tr(c, "seo_description"),
      keywords: String(c.seo_keyword ?? ""),
      path: `/${c.node.slug}`,
      image: c.image,
    });
  }
  const d = r.data;
  return pageMeta({
    title: s.tr(d, "title"),
    description: String(d.seo_description || d.description || ""),
    keywords: String(d.seo_keyword ?? ""),
    path: link(String(d.slug)),
    image: d.image,
  });
}

export default async function SlugPage({ params, searchParams }: PageProps<"/[...slug]">) {
  const [{ slug }, q] = await Promise.all([params, searchParams]);
  if (slug.join("/") === "404.html") return <Page404 />;
  const r = await resolve(slug);
  if (!r) redirect("/404.html");
  if (r.kind === "redirect") redirect(r.to);
  if (r.kind === "category") {
    const { cur, page, base } = r;
    const view =
      cur.template === "gioi-thieu" ? (
        <About cur={cur} />
      ) : cur.template === "thuong-hieu" ? (
        <Brands cur={cur} />
      ) : cur.ctype === "product" ? (
        <ProductList cur={cur} page={page} q={q} base={base} />
      ) : cur.ctype === "news" ? (
        <NewsList cur={cur} page={page} q={q} base={base} />
      ) : (
        <PageDetail cur={cur} />
      );
    return <Shell here={{ cur }}>{view}</Shell>;
  }
  const nodeId = r.data.node_id;
  after(() => countView(nodeId));
  return (
    <Shell here={{ cur: r.cat }}>
      {r.kind === "product" ? <ProductDetail data={r.data} cat={r.cat} /> : <NewsDetail data={r.data} cat={r.cat} />}
    </Shell>
  );
}
