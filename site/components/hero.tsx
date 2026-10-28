import { site } from "@/site/lib/ctx";
import { strip } from "@/site/lib/text";
import { src } from "@/site/lib/url";
import { Adm } from "./adm";

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
