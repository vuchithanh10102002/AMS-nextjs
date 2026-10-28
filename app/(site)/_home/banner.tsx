import { siteUrl } from "@/lib/site";
import { Adm } from "@/site/components/adm";
import { site } from "@/site/lib/ctx";
import { langHref, tel } from "@/site/lib/url";

export async function HomeBanner() {
  const s = await site();
  const { t } = s;
  const hotline = t("company_hotline");
  return (
    <section className="ams-index-banner" data-bg={siteUrl() + t("home_tab_2")}>
      <Adm m="lang" v="home_tab_2" mode="image" />
      <div className="wrap clearfix">
        <div className="ams-index-banner-left wow animate__fadeInLeft">
          <h2
            className="ams-index-banner-title"
            dangerouslySetInnerHTML={{ __html: s.ta("home_text_11", "textarea") }}
          />
          <a href={langHref(t("home_text_12_link"))} className="ams-btn ams-btn-red">
            {t("home_text_12")}
            <svg width="17" height="14">
              <use href="#i-arrow"></use>
            </svg>
          </a>
          <Adm m="lang" v="home_text_12" mode="text_link" />
        </div>
        <div className="ams-index-banner-right wow animate__fadeInRight">
          <div
            className="ams-index-banner-sub"
            dangerouslySetInnerHTML={{ __html: s.ta("home_text_13", "text") }}
          />
          <a href={`tel:${tel(hotline)}`} className="ams-index-banner-phone">
            <svg width="24" height="40">
              <use href="#i-phone"></use>
            </svg>
            {hotline}
          </a>
        </div>
      </div>
    </section>
  );
}
