import { query, type Row } from "@/lib/db";
import { site } from "@/site/lib/ctx";
import { link, src } from "@/site/lib/data";
import { Adm } from "./adm";

const strip = (s: string) => s.replace(/<[^>]*>/g, "");

export async function Hero(p: {
  title: string;
  image?: string | null;
  cls?: string;
  desc?: string;
  descAdm?: number;
  crumbs?: { link: string; title: string }[];
  crumbHtml?: string;
}) {
  const s = await site();
  const img = p.image ? p.image : s.t("general_text_55");
  return (
    <>
      <section className={`ams-hero${p.cls ? " " + p.cls : ""}${p.desc ? " ams-hero-seo" : ""}`}>
        {img ? <img src={src(img)} className="ams-hero-bg" alt={strip(p.title)} width="1920" height="533" data-eager="1" /> : null}
        <div className="wrap">
          <div className="ams-hero-box">
            <h1 className="ams-hero-title" dangerouslySetInnerHTML={{ __html: p.title }} />
            {p.desc ? (
              <>
                <div className="ams-seo-more ams-hero-more">
                  <div className="ams-seo-text" dangerouslySetInnerHTML={{ __html: p.desc }} />
                  <button type="button" className="ams-seo-btn btn_read_more">
                    <span className="ams-more">{s.t("general_text_52")}</span>
                    <span className="ams-less">{s.t("general_text_63")}</span>
                  </button>
                </div>
                {p.descAdm ? <Adm m="category" v={p.descAdm} /> : null}
              </>
            ) : null}
          </div>
        </div>
      </section>
      <div className="ams-bar">
        <div className="wrap">
          {p.crumbs ? (
            <ul className="ams-crumb">
              {p.crumbs.map((c, k) => (
                <li key={k}>{k < p.crumbs!.length - 1 ? <a href={c.link}>{c.title}</a> : c.title}</li>
              ))}
            </ul>
          ) : (
            <div className="ams-crumb" dangerouslySetInnerHTML={{ __html: p.crumbHtml ?? "" }} />
          )}
        </div>
      </div>
    </>
  );
}

export async function Links() {
  const s = await site();
  const hotline = s.t("company_hotline");
  return (
    <section className="ams-links">
      <div className="wrap">
        <div className="row clearfix">
          <div className="ams-links-col">
            <a href={`tel:${hotline.replace(/[^0-9+]/g, "")}`} className="ams-link-box ams-link-call">
              <span className="ams-link-label">{s.t("general_text_50")}</span>
              <span className="ams-link-phone">{hotline}</span>
              <svg width="20" height="20"><use href="#i-call"></use></svg>
            </a>
            <Adm m="lang" v="general_text_50" mode="text" />
          </div>
          <div className="ams-links-col">
            <button type="button" className="ams-link-box ams-link-quote btn_quote">
              <span className="ams-link-text">{s.t("general_text_51")}</span>
              <svg width="17" height="14"><use href="#i-arrow"></use></svg>
            </button>
            <Adm m="lang" v="general_text_51" mode="text" />
          </div>
        </div>
      </div>
    </section>
  );
}

export async function Pager({ base, page, pages, query: qs }: { base: string; page: number; pages: number; query: string }) {
  if (pages < 2) return null;
  const s = await site();
  const href = (n: number) => `${base}${n > 1 ? `/page:${n}` : ""}${qs ? `?${qs}` : ""}`;
  let start = Math.max(1, page - 4);
  const end = Math.min(pages, start + 8);
  start = Math.max(1, end - 8);
  const nums = [];
  for (let i = start; i <= end; i++) nums.push(i);
  const arrow = <svg width="10" height="10"><use href="#i-arrow-sm"></use></svg>;
  return (
    <ul className="ams-pager">
      {page > 1 && (
        <li className="ams-pager-prev">
          <a href={href(page - 1)} aria-label={s.t("general_text_53")} rel="prev">{arrow}</a>
        </li>
      )}
      {nums.map((n) =>
        n === page ? (
          <li key={n} className="active"><span>{n}</span></li>
        ) : (
          <li key={n}><a href={href(n)}>{n}</a></li>
        ),
      )}
      {page < pages && (
        <li className="next">
          <a href={href(page + 1)} aria-label={s.t("general_text_54")} rel="next">{arrow}</a>
        </li>
      )}
    </ul>
  );
}

export async function ProductItem({ v, tag = "h2" }: { v: Row; tag?: "h2" | "h3" }) {
  const s = await site();
  const href = link(v.slug);
  const name = s.tr(v, "title");
  const desc = s.tr(v, "description");
  const m = desc.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const use = strip(m ? m[1] : desc);
  const Tag = tag;
  return (
    <div className="ams-sp-card">
      <a href={href} className="ams-sp-img">
        {v.image ? <img src={src(v.image)} alt={name} loading="lazy" /> : null}
      </a>
      <Tag className="ams-sp-name">
        <a href={href}>{name}</a>
        <Adm m="product" v={v.node_id} />
      </Tag>
      <p className="ams-sp-desc" dangerouslySetInnerHTML={{ __html: use }} />
      <div className="ams-sp-btns">
        <a href={href} className="ams-sp-btn">{s.t("general_text_61")}</a>
        <button type="button" className="ams-sp-quote btn_quote" data-product={strip(name)}>{s.t("general_text_44")}</button>
      </div>
    </div>
  );
}

export async function NewsItem({ v, tag = "h2" }: { v: Row; tag?: "h2" | "h3" }) {
  const s = await site();
  const href = link(v.slug);
  const name = s.tr(v, "title");
  const tags = await query(
    "SELECT n.title, n.title_en FROM categories c JOIN nodes n ON n.id = c.node_id WHERE c.id IN (SELECT category_id FROM (SELECT category_id FROM category_linkeds WHERE node_id = ? ORDER BY id LIMIT 10) x) ORDER BY n.pos DESC, n.id DESC LIMIT 3",
    [v.node_id],
  );
  const Tag = tag;
  return (
    <div className="ams-tt-item">
      <a href={href} className="wrap-img img-100 ams-tt-img">
        {v.image ? <img src={src(v.image)} alt={name} loading="lazy" /> : null}
      </a>
      {tags.length > 0 && (
        <div className="ams-tt-tags">
          {tags.map((t, i) => (
            <span key={i}>{s.tr(t, "title")}</span>
          ))}
        </div>
      )}
      <Tag className="ams-tt-title">
        <a href={href}>{name}</a>
        <Adm m="news" v={v.node_id} />
      </Tag>
      <a href={href} className="ams-news-more">
        {s.t("home_text_18")}
        <svg width="10" height="10"><use href="#i-arrow-sm"></use></svg>
      </a>
    </div>
  );
}
