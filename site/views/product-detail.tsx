import type { Row } from "@/lib/db";
import { siteUrl } from "@/lib/site";
import { Adm } from "@/site/components/adm";
import { Links, ProductItem } from "@/site/components/blocks";
import { site } from "@/site/lib/ctx";
import { crumbHtml } from "@/site/lib/crumb";
import { getNodes, src, type Cat } from "@/site/lib/data";

const strip = (s: string) => s.replace(/<[^>]*>/g, "");

export async function ProductDetail({ data, cat }: { data: Row; cat: Cat | null }) {
  const s = await site();
  const { t, tr } = s;
  const name = tr(data, "title");
  const imgs = [String(data.image ?? ""), ...String(data.images ?? "").split(",")].filter(Boolean);
  const hotline = t("company_hotline");
  const related = cat ? await getNodes("product", { categoryId: cat.id, where: "n.id <> ?", params: [data.node_id], limit: 8 }) : [];
  const attrs = tr(data, "content_2");
  const base = siteUrl();

  return (
    <>
      <div className="ams-bar">
        <div className="wrap">
          <div className="ams-crumb" dangerouslySetInnerHTML={{ __html: await crumbHtml(cat, data) }} />
        </div>
      </div>

      <section className="ams-pd-top">
        <div className="wrap clearfix">
          <div className="ams-pd-gallery">
            <div className="ams-pd-main">
              <div className="owl-carousel pd_main_slider">
                {imgs.map((im, k) => (
                  <a key={k} href={base + im} className="ams-pd-slide btn_pd_zoom">
                    {k === 0 ? <img src={src(im)} alt={name} data-eager="1" /> : <img src={src(im)} alt={name} loading="lazy" />}
                  </a>
                ))}
              </div>
              <span className="ams-pd-zoom-ico">
                <svg width="18" height="18"><use href="#i-search"></use></svg>
              </span>
            </div>
            {imgs.length > 1 && (
              <div className="owl-carousel pd_thumb_slider">
                {imgs.map((im, k) => (
                  <button key={k} type="button" className={`ams-pd-thumb btn_pd_thumb${k === 0 ? " active" : ""}`} data-src={base + im}>
                    <img src={src(im)} alt={name} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ams-pd-info">
            <h1 className="ams-pd-title" dangerouslySetInnerHTML={{ __html: name + s.adm("product", data.node_id) }} />
            <div className="ams-pd-short" dangerouslySetInnerHTML={{ __html: tr(data, "description") }} />
            <div className="ams-pd-btns">
              <button type="button" className="ams-pd-box btn_quote" data-product={strip(name)}>
                <span>{t("general_text_51")}</span>
                <svg width="17" height="14"><use href="#i-arrow"></use></svg>
              </button>
            </div>
            <div
              className="ams-pd-call"
              dangerouslySetInnerHTML={{
                __html: `${s.ta("product_text_7", "text")} <a href="tel:${hotline.replace(/[^0-9+]/g, "")}"><svg width="17" height="17"><use href="#i-call"></use></svg>${hotline}</a>`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="ams-pd-tabs">
        <div className="wrap">
          <div className="ams-pd-tab-nav clearfix">
            <button type="button" className="ams-pd-tab btn_pd_tab active" data-tab="0">{t("product_text_2")}</button>
            {attrs !== "" && (
              <button type="button" className="ams-pd-tab btn_pd_tab" data-tab="1">{t("product_text_3")}</button>
            )}
            <button type="button" className="ams-pd-tab btn_pd_tab" data-tab={attrs !== "" ? 2 : 1}>{t("product_text_4")}</button>
          </div>
          <div className="ams-pd-panes">
            <div className="ams-pd-pane active">
              <h2 className="ams-pd-pane-title" dangerouslySetInnerHTML={{ __html: s.ta("product_text_2", "text") }} />
              <div className="ams-content" dangerouslySetInnerHTML={{ __html: tr(data, "content") }} />
            </div>
            {attrs !== "" && (
              <div className="ams-pd-pane">
                <h2 className="ams-pd-pane-title" dangerouslySetInnerHTML={{ __html: s.ta("product_text_3", "text") }} />
                <div className="ams-pd-attrs-box" dangerouslySetInnerHTML={{ __html: attrs }} />
              </div>
            )}
            <div className="ams-pd-pane">
              <h2 className="ams-pd-pane-title" dangerouslySetInnerHTML={{ __html: s.ta("product_text_4", "text") }} />
              <ul className="ams-pd-docs">
                {[5, 6].map((i) => (
                  <li key={i}>
                    <button type="button" className="btn_quote" data-product={strip(`${t(`product_text_${i}`)} – ${name}`)}>
                      <svg width="17" height="14"><use href="#i-mail"></use></svg>
                      {t(`product_text_${i}`)}
                    </button>
                    <Adm m="lang" v={`product_text_${i}`} mode="text" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="ams-pd-related">
          <div className="wrap">
            <h2 className="ams-title" dangerouslySetInnerHTML={{ __html: s.ta("product_text_10", "text") }} />
            <div className="owl-carousel pd_rel_slider ams-dot-slider">
              {related.map((v) => (
                <ProductItem key={v.node_id} v={v} tag="h3" />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="ams-lightbox pd_lightbox">
        <button type="button" className="ams-lb-close btn_lb_close" aria-label={t("general_text_28")}>
          <svg width="20" height="20"><use href="#i-x"></use></svg>
        </button>
        <button type="button" className="ams-lb-nav ams-lb-prev btn_lb_prev" aria-label={t("product_text_8")}>
          <svg width="17" height="14"><use href="#i-arrow-l"></use></svg>
        </button>
        {imgs.length ? <img src={src(imgs[0])} className="ams-lb-img" alt={name} loading="lazy" /> : null}
        <button type="button" className="ams-lb-nav ams-lb-next btn_lb_next" aria-label={t("product_text_9")}>
          <svg width="17" height="14"><use href="#i-arrow"></use></svg>
        </button>
      </div>

      <Links />
    </>
  );
}
