import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { Adm } from "@/site/components/adm";
import { Hero, Links, NewsItem, Pager, ProductItem } from "@/site/components/blocks";
import { Shell } from "@/site/components/shell";
import { site } from "@/site/lib/ctx";
import { paged } from "@/site/lib/data";
import { pageMeta } from "@/site/lib/meta";
import { queryString } from "@/site/views/product-list";

export async function generateMetadata(): Promise<Metadata> {
  const s = await site();
  return pageMeta({ title: s.settings.title, description: s.settings.description, keywords: s.settings.keyword, path: "/search" });
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const q = await searchParams;
  const one = (k: string) => (Array.isArray(q[k]) ? q[k]![0] : q[k]) ?? "";
  const s = await site();
  const { t } = s;
  const type = one("type") === "news" ? "news" : "product";
  const key = one("s");
  const page = Math.max(1, parseInt(one("page"), 10) || 1);
  const table = type === "news" ? "news" : "products";
  const where = ["n.type = ?", "n.status = 1"];
  const params: unknown[] = [type];
  if (key) {
    where.push("n.title LIKE ?");
    params.push(`%${key}%`);
  }
  const data = await paged(`FROM nodes n JOIN ${table} m ON m.node_id = n.id WHERE ${where.join(" AND ")}`, params, "n.pos DESC, n.id DESC", page, type === "news" ? 20 : 12, "n.*, m.*, n.id AS node_id");
  const total = data.rows.length ? data.total : 0;
  const title = t("general_text_25");
  const base = siteUrl();
  const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  const enc = (v: string) => encodeURIComponent(v).replace(/%20/g, "+");
  return (
    <Shell here={{ search: key }}>
      <Hero title={title} crumbs={[{ link: base, title: t("header_text_5") }, { link: "", title }]} />
      <section className="ams-sr">
        <div className="wrap">
          <div className="ams-sr-head">
            <div className="ams-sr-info" dangerouslySetInnerHTML={{ __html: `${s.ta("general_text_41", "text")} <strong>"${esc(key)}"</strong>: ${total} ${t("general_text_59")}` }} />
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
              {type === "product" ? (
                <div className="ams-sr-grid">
                  <div className="row clearfix">
                    {data.rows.map((v) => (
                      <div key={v.node_id} className="ams-sr-col">
                        <ProductItem v={v} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="ams-tt-list ams-sr-news">
                  {data.rows.map((v) => (
                    <NewsItem key={v.node_id} v={v} />
                  ))}
                </div>
              )}
              <div className="ams-tt-pager">
                <Pager base="/search" page={data.page} pages={data.pages} query={queryString(q)} />
              </div>
            </>
          ) : (
            <div className="ams-sr-empty" dangerouslySetInnerHTML={{ __html: s.ta("general_text_42", "text") }} />
          )}
        </div>
      </section>
      <Links />
    </Shell>
  );
}
