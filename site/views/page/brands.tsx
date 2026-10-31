import { Hero } from "@/site/components/hero";
import { Links } from "@/site/components/links";
import { site } from "@/site/lib/ctx";
import { crumbHtml } from "@/site/lib/crumb";
import { allCategories, type Cat } from "@/site/lib/queries/category";
import { getHangs } from "@/site/lib/queries/rows";
import { catLink, src } from "@/site/lib/url";

export async function Brands({ cur }: { cur: Cat }) {
  const s = await site();
  const hangs = await getHangs();
  const root = (await allCategories()).find((c) => c.ctype === "product" && c.parent_id == null);
  const rootLink = s.u(root ? catLink(root) : "/");
  return (
    <>
      <Hero
        title={s.tr(cur.node, "title")}
        image={cur.image}
        desc={s.tr(cur, "description")}
        descAdm={cur.node.id}
        crumbHtml={await crumbHtml(cur)}
      />
      <section className="ams-th">
        <div className="wrap">
          <div className="row clearfix">
            {hangs.map((h) => {
              const href = `${rootLink}?brand=${h.id}`;
              return (
                <div key={h.id} className="ams-th-col">
                  <div className="ams-th-item">
                    <a href={href} className="ams-th-logo">
                      {h.image ? (
                        <img src={src(h.image)} alt={h.title ?? undefined} loading="lazy" />
                      ) : null}
                    </a>
                    <h2
                      className="ams-th-name"
                      dangerouslySetInnerHTML={{ __html: h.title + s.adm("hang", h.id) }}
                    />
                    <a href={href} className="ams-news-more">
                      {s.t("general_text_65")}
                      <svg width="10" height="10">
                        <use href="#i-arrow-sm"></use>
                      </svg>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <Links />
    </>
  );
}
