import { Adm } from "@/site/components/adm";
import { site } from "@/site/lib/ctx";
import { getRates } from "@/site/lib/queries/rows";
import { strip } from "@/site/lib/text";
import { src } from "@/site/lib/url";

export async function HomeReviews() {
  const [s, rates] = await Promise.all([site(), getRates(10)]);
  const { t, tr } = s;
  return (
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
  );
}
