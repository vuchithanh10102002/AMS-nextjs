import { Adm } from "@/site/components/adm";
import { site } from "@/site/lib/ctx";
import { categoryBySlug } from "@/site/lib/queries/category";
import { newsIn } from "@/site/lib/queries/node";
import { catLink, link, src } from "@/site/lib/url";

export async function HomeNewsBlock({
  cls,
  hook,
  title,
  slug,
}: {
  cls: string;
  hook: string;
  title: string;
  slug: string;
}) {
  const [s, cat] = await Promise.all([site(), categoryBySlug(slug)]);
  if (!cat) return null;
  const items = await newsIn(cat.id, 8);
  if (!items.length) return null;
  const { t, tr } = s;
  return (
    <section className={cls}>
      <div className="wrap">
        <div className="ams-index-head clearfix">
          <h2
            className="ams-title wow animate__fadeInUp"
            dangerouslySetInnerHTML={{ __html: s.ta(title, "text") }}
          />
          <a href={s.u(catLink(cat))} className="ams-btn wow animate__fadeInRight">
            {t("home_text_16")}
            <svg width="17" height="14">
              <use href="#i-arrow"></use>
            </svg>
          </a>
          <Adm m="lang" v="home_text_16" mode="text" />
        </div>
        <div
          className={`owl-carousel ${hook} ams-news-slider ams-dot-slider wow animate__fadeInUp`}
        >
          {items.map((v) => {
            const href = s.u(link(v.slug));
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
                  <svg width="10" height="10">
                    <use href="#i-arrow-sm"></use>
                  </svg>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
