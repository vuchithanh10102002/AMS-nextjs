import { site } from "@/site/lib/ctx";
import { tel } from "@/site/lib/url";
import { Adm } from "./adm";

export async function Links() {
  const s = await site();
  const hotline = s.t("company_hotline");
  return (
    <section className="ams-links">
      <div className="wrap">
        <div className="row clearfix">
          <div className="ams-links-col">
            <a href={`tel:${tel(hotline)}`} className="ams-link-box ams-link-call">
              <span className="ams-link-label">{s.t("general_text_50")}</span>
              <span className="ams-link-phone">{hotline}</span>
              <svg width="20" height="20">
                <use href="#i-call"></use>
              </svg>
            </a>
            <Adm m="lang" v="general_text_50" mode="text" />
          </div>
          <div className="ams-links-col">
            <button type="button" className="ams-link-box ams-link-quote btn_quote">
              <span className="ams-link-text">{s.t("general_text_51")}</span>
              <svg width="17" height="14">
                <use href="#i-arrow"></use>
              </svg>
            </button>
            <Adm m="lang" v="general_text_51" mode="text" />
          </div>
        </div>
      </div>
    </section>
  );
}
