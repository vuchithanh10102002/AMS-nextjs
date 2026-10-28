import { Adm } from "@/site/components/adm";
import { site } from "@/site/lib/ctx";
import { allCategories, categoryBySlug } from "@/site/lib/queries/category";
import { catLink, src } from "@/site/lib/url";

export async function HomeIndustries() {
  const [s, root, all] = await Promise.all([site(), categoryBySlug("nganh-nghe"), allCategories()]);
  const { t, tr } = s;
  const industries = root ? all.filter((c) => c.parent_id == root.id && c.featured == 1).slice(0, 12) : [];
  if (!industries.length) return null;
  return (
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
  );
}
