import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { Adm } from "@/site/components/adm";
import { Shell } from "@/site/components/shell";
import { site } from "@/site/lib/ctx";
import { allCategories, catLink, categoriesWhere, categoryBySlug, getNodes, getRows, link, src } from "@/site/lib/data";
import { pageMeta } from "@/site/lib/meta";

export async function generateMetadata(): Promise<Metadata> {
  const s = await site();
  return pageMeta({ title: s.settings.title, description: s.settings.description, keywords: s.settings.keyword, path: "/", image: s.t("home_tab_1") });
}

const strip = (s: string) => s.replace(/<[^>]*>/g, "");

export default async function Home() {
  const s = await site();
  const { t, tr } = s;
  const langLink = (key: string) => {
    const v = t(key);
    return v === "" || v === "#" || v.includes(":") ? v : "/" + v.replace(/^\/+/, "");
  };
  const hotline = t("company_hotline");
  const tel = hotline.replace(/[^0-9+]/g, "");
  const cats = (await categoriesWhere("home_menu")).filter((c) => c.ctype === "product");
  const indRoot = await categoryBySlug("nganh-nghe");
  const industries = indRoot
    ? (await allCategories()).filter((c) => c.parent_id == indRoot.id && c.featured == 1).slice(0, 12)
    : [];
  const partners = await getRows("hangs", { featured: 1 }, 12);
  const rates = await getRows("rates", {}, 10);
  const faqs = await getRows("faqs", {}, 10);
  const blocks = await Promise.all(
    [
      { cls: "ams-index-news", hook: "news_slider", title: "home_text_15", slug: "tin-tuc" },
      { cls: "ams-index-event", hook: "event_slider", title: "home_text_17", slug: "su-kien" },
    ].map(async (b) => {
      const cat = await categoryBySlug(b.slug);
      return { ...b, cat, items: cat ? await getNodes("news", { categoryId: cat.id, limit: 8 }) : [] };
    }),
  );

  return (
    <Shell here={{ home: true }}>
      <section className="ams-index-hero">
        <img src={src(t("home_tab_1"))} className="ams-index-hero-bg" alt={strip(t("home_text_1"))} width="1920" height="533" fetchPriority="high" />
        <Adm m="lang" v="home_tab_1" mode="image" />
        <div className="wrap">
          <div className="ams-index-hero-card">
            <h1 className="ams-index-hero-title" dangerouslySetInnerHTML={{ __html: s.ta("home_text_1", "editor") }} />
            <p className="ams-index-hero-desc" dangerouslySetInnerHTML={{ __html: s.ta("home_text_2", "textarea") }} />
          </div>
        </div>
      </section>

      <section className="ams-index-cta">
        <div className="wrap">
          <div className="container-fluid">
            <div className="row">
              <div className="col-xs-12 col-sm-6">
                <a href={`tel:${tel}`} className="ams-index-cta-box ams-index-cta-call">
                  <span className="ams-index-cta-label">{t("home_text_3")}</span>
                  <span className="ams-index-cta-phone">
                    <svg width="24" height="40"><use href="#i-phone"></use></svg>
                    {hotline}
                  </span>
                </a>
                <Adm m="lang" v="home_text_3" mode="text" />
              </div>
              <div className="col-xs-12 col-sm-6">
                <a href={langLink("home_text_4_link")} className="ams-index-cta-box ams-index-cta-quality">
                  <span className="ams-index-cta-label">{t("home_text_4")}</span>
                  <svg width="17" height="14"><use href="#i-arrow"></use></svg>
                </a>
                <Adm m="lang" v="home_text_4" mode="text_link" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {cats.length > 0 && (
        <section className="ams-index-cat">
          <div className="wrap">
            <h2 className="ams-title wow animate__fadeInUp" dangerouslySetInnerHTML={{ __html: s.ta("home_text_5", "text") }} />
            <div className="container-fluid">
              <div className="row ams-index-cat-row">
                {cats.slice(0, 5).map((v, k) => (
                  <div key={v.id} className="col-xs-6 col-sm-4 col-md-1-5 wow animate__fadeInUp" data-wow-delay={`${k / 10}s`}>
                    <a href={catLink(v)} className="ams-index-cat-item">
                      <span className="wrap-img img-100">
                        <img src={src(v.image)} alt={tr(v.node, "title")} loading="lazy" />
                      </span>
                      <span className="ams-index-cat-name">{tr(v.node, "title")}</span>
                    </a>
                    <Adm m="category" v={v.node.id} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {industries.length > 0 && (
        <section className="ams-index-ind">
          <div className="wrap">
            <h2 className="ams-title wow animate__fadeInUp" dangerouslySetInnerHTML={{ __html: s.ta("home_text_6", "text") }} />
            <div className="ams-index-ind-tabs wow animate__fadeInUp">
              <button type="button" className="ams-arrow-btn ams-index-ind-prev btn_ind_prev" aria-label={t("general_text_29")}>
                <svg width="17" height="14"><use href="#i-arrow-l"></use></svg>
              </button>
              <div className="ams-index-ind-strip ind_strip">
                {industries.map((v, k) => (
                  <button key={v.id} type="button" className={`ams-index-ind-tab btn_ind_tab${k === 0 ? " active" : ""}`} data-ind={k}>
                    {tr(v.node, "title")}
                  </button>
                ))}
              </div>
              <button type="button" className="ams-arrow-btn ams-index-ind-next btn_ind_next" aria-label={t("general_text_30")}>
                <svg width="17" height="14"><use href="#i-arrow"></use></svg>
              </button>
            </div>
            <div className="ams-index-ind-panes wow animate__fadeInUp" data-wow-delay="0.1s">
              {industries.map((v, k) => (
                <div key={v.id} className={`ams-index-ind-pane ind_pane${k === 0 ? " active" : ""}`} data-ind={k}>
                  <div className="ams-index-ind-text">
                    <div className="ams-index-ind-label" dangerouslySetInnerHTML={{ __html: s.ta("home_text_7", "text") }} />
                    <h3 className="ams-index-ind-name" dangerouslySetInnerHTML={{ __html: tr(v.node, "title") + s.adm("category", v.node.id) }} />
                    <p className="ams-index-ind-desc" dangerouslySetInnerHTML={{ __html: tr(v, "description") }} />
                    <a href={catLink(v)} className="ams-btn">
                      {t("home_text_8")}
                      <svg width="17" height="14"><use href="#i-arrow"></use></svg>
                    </a>
                    <Adm m="lang" v="home_text_8" mode="text" />
                  </div>
                  <div className="ams-index-ind-img">
                    <span className="wrap-img img-100">
                      <img src={src(v.image)} alt={tr(v.node, "title")} loading="lazy" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="ams-index-partner">
        <div className="wrap">
          <h2 className="ams-title wow animate__fadeInUp" dangerouslySetInnerHTML={{ __html: s.ta("home_text_9", "text") }} />
          <p className="ams-index-partner-desc wow animate__fadeInUp" dangerouslySetInnerHTML={{ __html: s.ta("home_text_10", "textarea") }} />
          {partners.length > 0 && (
            <div className="ams-index-partner-list wow animate__fadeInUp" data-wow-delay="0.1s">
              <div className="owl-carousel partner_slider ams-dot-slider">
                {partners.map((v) => (
                  <div key={v.id} className="ams-index-partner-cell">
                    <a
                      href={v.website || undefined}
                      className="ams-index-partner-item"
                      {...(v.website ? { target: "_blank", rel: "noopener" } : {})}
                    >
                      <img src={src(v.image)} alt={v.title} loading="lazy" />
                    </a>
                    <Adm m="hang" v={v.id} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="ams-index-banner" data-bg={siteUrl() + t("home_tab_2")}>
        <Adm m="lang" v="home_tab_2" mode="image" />
        <div className="wrap clearfix">
          <div className="ams-index-banner-left wow animate__fadeInLeft">
            <h2 className="ams-index-banner-title" dangerouslySetInnerHTML={{ __html: s.ta("home_text_11", "textarea") }} />
            <a href={langLink("home_text_12_link")} className="ams-btn ams-btn-red">
              {t("home_text_12")}
              <svg width="17" height="14"><use href="#i-arrow"></use></svg>
            </a>
            <Adm m="lang" v="home_text_12" mode="text_link" />
          </div>
          <div className="ams-index-banner-right wow animate__fadeInRight">
            <div className="ams-index-banner-sub" dangerouslySetInnerHTML={{ __html: s.ta("home_text_13", "text") }} />
            <a href={`tel:${tel}`} className="ams-index-banner-phone">
              <svg width="24" height="40"><use href="#i-phone"></use></svg>
              {hotline}
            </a>
          </div>
        </div>
      </section>

      <section className="ams-index-review">
        <div className="wrap clearfix">
          <div className="ams-index-review-left">
            <h2 className="ams-title wow animate__fadeInUp" dangerouslySetInnerHTML={{ __html: s.ta("home_text_14", "text") }} />
            {rates.length > 0 && (
              <div className="ams-index-review-card wow animate__fadeInLeft">
                <div className="owl-carousel review_slider">
                  {rates.map((v) => {
                    const name = tr(v, "fullname");
                    const last = name.trim().split(" ").pop() ?? "";
                    return (
                      <div key={v.id} className="ams-index-review-item">
                        <div className="ams-index-review-tag" dangerouslySetInnerHTML={{ __html: tr(v, "title") + s.adm("rate", v.id) }} />
                        <p className="ams-index-review-quote" dangerouslySetInnerHTML={{ __html: tr(v, "description") }} />
                        <div className="ams-index-review-author">
                          <span className="ams-index-review-avatar">{Array.from(last)[0] ?? ""}</span>
                          <span className="ams-index-review-name">{name}</span>
                          <span className="ams-index-review-pos">{tr(v, "nghenghiep")}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="ams-index-review-nav">
                  <button type="button" className="ams-arrow-btn btn_review_prev" aria-label={t("general_text_31")}>
                    <svg width="17" height="14"><use href="#i-arrow-l"></use></svg>
                  </button>
                  <button type="button" className="ams-arrow-btn ams-arrow-on btn_review_next" aria-label={t("general_text_32")}>
                    <svg width="17" height="14"><use href="#i-arrow"></use></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="ams-index-review-img wow animate__fadeInRight">
            <span className="wrap-img img-100">
              <img src={src(t("home_tab_3"))} alt={strip(t("home_text_14"))} loading="lazy" />
            </span>
            <Adm m="lang" v="home_tab_3" mode="image" />
          </div>
        </div>
      </section>

      {blocks
        .filter((b) => b.cat && b.items.length)
        .map((b) => (
          <section key={b.cls} className={b.cls}>
            <div className="wrap">
              <div className="ams-index-head clearfix">
                <h2 className="ams-title wow animate__fadeInUp" dangerouslySetInnerHTML={{ __html: s.ta(b.title, "text") }} />
                <a href={catLink(b.cat!)} className="ams-btn wow animate__fadeInRight">
                  {t("home_text_16")}
                  <svg width="17" height="14"><use href="#i-arrow"></use></svg>
                </a>
                <Adm m="lang" v="home_text_16" mode="text" />
              </div>
              <div className={`owl-carousel ${b.hook} ams-news-slider ams-dot-slider wow animate__fadeInUp`}>
                {b.items.map((v) => {
                  const href = link(v.slug);
                  return (
                    <div key={v.node_id} className="ams-news-item">
                      <a href={href} className="wrap-img img-100 ams-news-img">
                        <img src={src(v.image)} alt={tr(v, "title")} loading="lazy" />
                      </a>
                      <Adm m="news" v={v.node_id} />
                      <h3 className="ams-news-title">
                        <a href={href}>{tr(v, "title")}</a>
                      </h3>
                      <a href={href} className="ams-news-more">
                        {t("home_text_18")}
                        <svg width="10" height="10"><use href="#i-arrow-sm"></use></svg>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}

      {faqs.length > 0 && (
        <section className="ams-index-faq">
          <div className="wrap">
            <h2 className="ams-title wow animate__fadeInUp" dangerouslySetInnerHTML={{ __html: s.ta("home_text_19", "text") }} />
            <div className="ams-index-faq-list wow animate__fadeInUp">
              {faqs.map((v, k) => (
                <div key={v.id} className={`ams-faq-item${k === 0 ? " open" : ""}`}>
                  <button type="button" className="ams-faq-head acc_head">
                    <span className="ams-faq-q">{tr(v, "title")}</span>
                    <span className="ams-faq-ico">
                      <svg width="16" height="16"><use href="#i-plus"></use></svg>
                    </span>
                  </button>
                  <Adm m="faq" v={v.id} />
                  <div className="ams-faq-body" dangerouslySetInnerHTML={{ __html: tr(v, "content") }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Shell>
  );
}
