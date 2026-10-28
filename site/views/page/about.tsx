import { Fragment } from "react";
import { siteUrl } from "@/lib/site";
import { Adm } from "@/site/components/adm";
import { Hero } from "@/site/components/hero";
import { Links } from "@/site/components/links";
import { site } from "@/site/lib/ctx";
import { crumbHtml } from "@/site/lib/crumb";
import { childrenOf, type Cat } from "@/site/lib/queries/category";
import { strip } from "@/site/lib/text";
import { src } from "@/site/lib/url";

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
