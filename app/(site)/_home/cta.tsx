import { Adm } from "@/site/components/adm";
import { site } from "@/site/lib/ctx";
import { langHref, tel } from "@/site/lib/url";

export async function HomeCta() {
  const { t, u } = await site();
  const hotline = t("company_hotline");
  return (
    <section className="ams-index-cta">
      <div className="wrap">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12 col-sm-6">
              <a href={`tel:${tel(hotline)}`} className="ams-index-cta-box ams-index-cta-call">
                <span className="ams-index-cta-label">{t("home_text_3")}</span>
                <span className="ams-index-cta-phone">
                  <svg width="24" height="40">
                    <use href="#i-phone"></use>
                  </svg>
                  {hotline}
                </span>
              </a>
              <Adm m="lang" v="home_text_3" mode="text" />
            </div>
            <div className="col-xs-12 col-sm-6">
              <a
                href={u(langHref(t("home_text_4_link")))}
                className="ams-index-cta-box ams-index-cta-quality"
              >
                <span className="ams-index-cta-label">{t("home_text_4")}</span>
                <svg width="17" height="14">
                  <use href="#i-arrow"></use>
                </svg>
              </a>
              <Adm m="lang" v="home_text_4" mode="text_link" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
