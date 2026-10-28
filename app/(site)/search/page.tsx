import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { Adm } from "@/site/components/adm";
import { Hero } from "@/site/components/hero";
import { Shell } from "@/site/components/layout/shell";
import { Links } from "@/site/components/links";
import { NewsItem } from "@/site/components/news-item";
import { Pager } from "@/site/components/pager";
import { ProductItem } from "@/site/components/product-item";
import { site } from "@/site/lib/ctx";
import { pageMeta } from "@/site/lib/meta";
import { redirect } from "next/navigation";
import { newsSearch } from "@/site/lib/queries/news";
import { outOfRange } from "@/site/lib/queries/paged";
import { productSearch } from "@/site/lib/queries/product";
import { queryString } from "@/site/lib/url";

export async function generateMetadata(): Promise<Metadata> {
  const s = await site();
  return pageMeta({
    title: s.settings.title,
    description: s.settings.description,
    keywords: s.settings.keyword,
    path: "/search",
  });
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const q = await searchParams;
  const one = (k: string) => (Array.isArray(q[k]) ? q[k]![0] : q[k]) ?? "";
  const s = await site();
  const { t } = s;
  const type = one("type") === "news" ? "news" : "product";
  const key = one("s");
  const page = Math.max(1, parseInt(one("page"), 10) || 1);
  const found =
    type === "news"
      ? { type: "news" as const, data: await newsSearch(key, page, 20) }
      : { type: "product" as const, data: await productSearch(key, page, 12) };
  const { data } = found;
  if (outOfRange(data)) redirect("/404.html");
  const total = data.rows.length ? data.total : 0;
  const title = t("general_text_25");
  const base = siteUrl();
  const esc = (v: string) =>
    v
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  const enc = (v: string) => encodeURIComponent(v).replace(/%20/g, "+");
  return (
    <Shell here={{ search: key }}>
      <Hero
        title={title}
        crumbs={[
          { link: base, title: t("header_text_5") },
          { link: "", title },
        ]}
      />
      <section className="ams-sr">
        <div className="wrap">
          <div className="ams-sr-head">
            <div
              className="ams-sr-info"
              dangerouslySetInnerHTML={{
                __html: `${s.ta("general_text_41", "text")} <strong>"${esc(key)}"</strong>: ${total} ${t("general_text_59")}`,
              }}
            />
            <ul className="ams-sr-tabs">
              <li className={type === "product" ? "active" : undefined}>
                <a href={`${base}search?s=${enc(key)}&type=product`}>{t("general_text_39")}</a>
                <Adm m="lang" v="general_text_39" mode="text" />
              </li>
              <li className={type === "news" ? "active" : undefined}>
                <a href={`${base}search?s=${enc(key)}&type=news`}>{t("general_text_40")}</a>
                <Adm m="lang" v="general_text_40" mode="text" />
              </li>
            </ul>
          </div>
          {total ? (
            <>
              {found.type === "product" ? (
                <div className="ams-sr-grid">
                  <div className="row clearfix">
                    {found.data.rows.map((v) => (
                      <div key={v.node_id} className="ams-sr-col">
                        <ProductItem v={v} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="ams-tt-list ams-sr-news">
                  {found.data.rows.map((v) => (
                    <NewsItem key={v.node_id} v={v} />
                  ))}
                </div>
              )}
              <div className="ams-tt-pager">
                <Pager base="/search" page={data.page} pages={data.pages} query={queryString(q)} />
              </div>
            </>
          ) : (
            <div
              className="ams-sr-empty"
              dangerouslySetInnerHTML={{ __html: s.ta("general_text_42", "text") }}
            />
          )}
        </div>
      </section>
      <Links />
    </Shell>
  );
}
