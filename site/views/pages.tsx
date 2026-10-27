import { Fragment } from "react";
import type { Row } from "@/lib/db";
import { siteUrl } from "@/lib/site";
import { Adm } from "@/site/components/adm";
import { Hero, Links, NewsItem, Pager } from "@/site/components/blocks";
import { site } from "@/site/lib/ctx";
import { crumbHtml } from "@/site/lib/crumb";
import { allCategories, catLink, childrenOf, getNodes, getRows, link, newsList, src, type Cat } from "@/site/lib/data";
import { queryString, type Query } from "./product-list";

const strip = (s: string) => s.replace(/<[^>]*>/g, "");

export async function NewsList({ cur, page, q, base }: { cur: Cat; page: number; q: Query; base: string }) {
  const s = await site();
  const data = await newsList(cur, page, 9);
  return (
    <>
      <Hero title={s.tr(cur.node, "title")} image={cur.image} cls="ams-hero-lg" crumbHtml={await crumbHtml(cur)} />
      <section className="ams-tt">
        <div className="wrap">
          {data.rows.length ? (
            <div className="ams-tt-list">
              {data.rows.map((v) => (
                <NewsItem key={v.node_id} v={v} />
              ))}
            </div>
          ) : (
            <div className="ams-sr-empty" dangerouslySetInnerHTML={{ __html: s.ta("general_text_43", "text") }} />
          )}
          <div className="ams-tt-pager">
            <Pager base={base} page={data.page} pages={data.pages} query={queryString(q)} />
          </div>
        </div>
      </section>
      <Links />
    </>
  );
}

export async function NewsDetail({ data, cat }: { data: Row; cat: Cat | null }) {
  const s = await site();
  const { t, tr } = s;
  const name = tr(data, "title");
  const url = siteUrl() + link(data.slug).slice(1);
  const related = cat ? await getNodes("news", { categoryId: cat.id, where: "n.id <> ?", params: [data.node_id], limit: 4 }) : [];
  const enc = (v: string) => encodeURIComponent(v).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
  return (
    <>
      {data.image ? (
        <div className="ams-nd-cover">
          <img src={src(data.image)} alt={name} data-eager="1" />
        </div>
      ) : null}

      <div className="ams-bar ams-nd-bar">
        <div className="wrap">
          <div className="ams-crumb" dangerouslySetInnerHTML={{ __html: await crumbHtml(cat, data) }} />
          <div className="ams-nd-share">
            <span dangerouslySetInnerHTML={{ __html: s.ta("news_text_1", "text") }} />
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener" aria-label="Facebook">
              <svg width="8" height="15"><use href="#i-fb"></use></svg>
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} target="_blank" rel="noopener" aria-label="LinkedIn">
              <svg width="15" height="14"><use href="#i-in"></use></svg>
            </a>
            <a href={`mailto:?subject=${enc(strip(name))}&body=${enc(url)}`} aria-label="Email">
              <svg width="17" height="14"><use href="#i-mail"></use></svg>
            </a>
            <button type="button" className="btn_copy_link" aria-label={t("news_text_2")}>
              <svg width="16" height="16"><use href="#i-link"></use></svg>
            </button>
          </div>
        </div>
      </div>

      <article className="ams-nd">
        <div className="wrap">
          <div className="ams-nd-head">
            <h1 className="ams-nd-title" dangerouslySetInnerHTML={{ __html: name + s.adm("news", data.node_id) }} />
          </div>
          <div className="ams-content" dangerouslySetInnerHTML={{ __html: tr(data, "content") }} />
          <div className="ams-nd-info">
            <div className="ams-nd-info-text" dangerouslySetInnerHTML={{ __html: s.ta("news_text_5", "textarea") }} />
            <button type="button" className="ams-nd-info-btn btn_quote" data-product={strip(name)}>
              {t("news_text_6")}
              <svg width="17" height="14"><use href="#i-arrow"></use></svg>
            </button>
            <Adm m="lang" v="news_text_6" mode="text" />
          </div>
        </div>
      </article>

      {related.length > 0 && cat && (
        <section className="ams-nd-more">
          <div className="wrap">
            <h2 className="ams-title" dangerouslySetInnerHTML={{ __html: s.ta("news_text_3", "text") }} />
            <div className="ams-tt-list">
              {related.map((v) => (
                <NewsItem key={v.node_id} v={v} tag="h3" />
              ))}
            </div>
            <div className="ams-nd-all">
              <a href={catLink(cat)} className="ams-btn ams-btn-red">
                {t("news_text_4")}
                <svg width="17" height="14"><use href="#i-arrow"></use></svg>
              </a>
              <Adm m="lang" v="news_text_4" mode="text" />
            </div>
          </div>
        </section>
      )}

      <Links />
    </>
  );
}

export async function About({ cur }: { cur: Cat }) {
  const s = await site();
  const { t, tr } = s;
  const subs = await childrenOf(cur);
  const logo = s.settings.favicon ?? "";
  const bg = siteUrl() + t("home_tab_4");
  return (
    <>
      <Hero title={tr(cur.node, "title")} image={cur.image} crumbHtml={await crumbHtml(cur)} />
      <div className="ams-gt">
        <section className="ams-gt-text">
          <div className="wrap">
            <div className="ams-content" dangerouslySetInnerHTML={{ __html: tr(cur, "content") }} />
            <Adm m="category" v={cur.node.id} />
          </div>
        </section>
        {subs.map((sub, k) => {
          const n = 70 + k * 4;
          return (
            <Fragment key={sub.id}>
              {k < 3 && (
                <section className="ams-quote" data-bg={bg}>
                  <div className="ams-quote-in wrap">
                    <div className="ams-quote-title" dangerouslySetInnerHTML={{ __html: s.ta(`general_text_${n}`, "text") }} />
                    <p className="ams-quote-text" dangerouslySetInnerHTML={{ __html: s.ta(`general_text_${n + 1}`, "textarea") }} />
                    <div className="ams-user">
                      <span className="ams-avatar">
                        {logo ? <img src={src(logo)} alt={strip(t(`general_text_${n + 2}`))} width="56" height="56" loading="lazy" /> : null}
                      </span>
                      <span className="ams-user-info">
                        <span className="ams-user-name" dangerouslySetInnerHTML={{ __html: s.ta(`general_text_${n + 2}`, "text") }} />
                        <span className="ams-user-role" dangerouslySetInnerHTML={{ __html: s.ta(`general_text_${n + 3}`, "text") }} />
                      </span>
                    </div>
                  </div>
                </section>
              )}
              <section className="ams-gt-text">
                <div className="wrap">
                  <div className="ams-content" dangerouslySetInnerHTML={{ __html: tr(sub, "content") }} />
                  <Adm m="category" v={sub.node.id} />
                </div>
              </section>
            </Fragment>
          );
        })}
        <section className="ams-gt-gallery">
          <div className="wrap">
            <div className="row clearfix">
              {[5, 6, 7, 8].map((i) => (
                <div key={i} className="ams-gt-gallery-item">
                  <div className={`wrap-img img-100 ${i < 7 ? "ams-gt-sq" : "ams-gt-wide"}`}>
                    {t(`home_tab_${i}`) ? <img src={src(t(`home_tab_${i}`))} alt={strip(tr(cur.node, "title"))} loading="lazy" /> : null}
                  </div>
                  <Adm m="lang" v={`home_tab_${i}`} mode="image" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Links />
    </>
  );
}

export async function Brands({ cur }: { cur: Cat }) {
  const s = await site();
  const hangs = await getRows("hangs", {}, 200);
  const root = (await allCategories()).find((c) => c.ctype === "product" && c.parent_id == null);
  const rootLink = root ? catLink(root) : "/";
  return (
    <>
      <Hero title={s.tr(cur.node, "title")} image={cur.image} desc={s.tr(cur, "description")} descAdm={cur.node.id} crumbHtml={await crumbHtml(cur)} />
      <section className="ams-th">
        <div className="wrap">
          <div className="row clearfix">
            {hangs.map((h) => {
              const href = `${rootLink}?brand=${h.id}`;
              return (
                <div key={h.id} className="ams-th-col">
                  <div className="ams-th-item">
                    <a href={href} className="ams-th-logo">
                      {h.image ? <img src={src(h.image)} alt={h.title} loading="lazy" /> : null}
                    </a>
                    <h2 className="ams-th-name" dangerouslySetInnerHTML={{ __html: h.title + s.adm("hang", h.id) }} />
                    <a href={href} className="ams-news-more">
                      {s.t("general_text_65")}
                      <svg width="10" height="10"><use href="#i-arrow-sm"></use></svg>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <Links />
    </>
  );
}

export async function PageDetail({ cur }: { cur: Cat }) {
  const s = await site();
  return (
    <>
      <Hero title={s.tr(cur.node, "title")} image={cur.image} crumbHtml={await crumbHtml(cur)} />
      <section className="ams-pg">
        <div className="wrap">
          <div
            className="ams-content"
            dangerouslySetInnerHTML={{ __html: `<h2 class="ams-pg-title">${s.tr(cur.node, "title")}${s.adm("category", cur.node.id)}</h2>${s.tr(cur, "content")}` }}
          />
        </div>
      </section>
      <Links />
    </>
  );
}
