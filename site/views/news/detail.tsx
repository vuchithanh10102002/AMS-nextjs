import { Adm } from "@/site/components/adm";
import { Links } from "@/site/components/links";
import { NewsItem } from "@/site/components/news-item";
import { site } from "@/site/lib/ctx";
import { crumbHtml } from "@/site/lib/crumb";
import type { Cat } from "@/site/lib/queries/category";
import { newsIn, type NewsRow } from "@/site/lib/queries/node";
import { strip } from "@/site/lib/text";
import { catLink, link, src } from "@/site/lib/url";

const enc = (v: string) =>
  encodeURIComponent(v).replace(
    /[!'()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
  );

export async function NewsDetail({ data, cat }: { data: NewsRow; cat: Cat | null }) {
  const s = await site();
  const { t, tr } = s;
  const name = tr(data, "title");
  const url = s.base + link(data.slug).slice(1);
  const related = cat ? await newsIn(cat.id, 4, data.node_id) : [];
  return (
    <>
      {data.image ? (
        <div className="ams-nd-cover">
          <img src={src(data.image)} alt={name} data-eager="1" />
        </div>
      ) : null}

      <div className="ams-bar ams-nd-bar">
        <div className="wrap">
          <div
            className="ams-crumb"
            dangerouslySetInnerHTML={{ __html: await crumbHtml(cat, data) }}
          />
          <div className="ams-nd-share">
            <span dangerouslySetInnerHTML={{ __html: s.ta("news_text_1", "text") }} />
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`}
              target="_blank"
              rel="noopener"
              aria-label="Facebook"
            >
              <svg width="8" height="15">
                <use href="#i-fb"></use>
              </svg>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn"
            >
              <svg width="15" height="14">
                <use href="#i-in"></use>
              </svg>
            </a>
            <a href={`mailto:?subject=${enc(strip(name))}&body=${enc(url)}`} aria-label="Email">
              <svg width="17" height="14">
                <use href="#i-mail"></use>
              </svg>
            </a>
            <button type="button" className="btn_copy_link" aria-label={t("news_text_2")}>
              <svg width="16" height="16">
                <use href="#i-link"></use>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <article className="ams-nd">
        <div className="wrap">
          <div className="ams-nd-head">
            <h1
              className="ams-nd-title"
              dangerouslySetInnerHTML={{ __html: name + s.adm("news", data.node_id) }}
            />
          </div>
          <div className="ams-content" dangerouslySetInnerHTML={{ __html: tr(data, "content") }} />
          <div className="ams-nd-info">
            <div
              className="ams-nd-info-text"
              dangerouslySetInnerHTML={{ __html: s.ta("news_text_5", "textarea") }}
            />
            <button type="button" className="ams-nd-info-btn btn_quote" data-product={strip(name)}>
              {t("news_text_6")}
              <svg width="17" height="14">
                <use href="#i-arrow"></use>
              </svg>
            </button>
            <Adm m="lang" v="news_text_6" mode="text" />
          </div>
        </div>
      </article>

      {related.length > 0 && cat && (
        <section className="ams-nd-more">
          <div className="wrap">
            <h2
              className="ams-title"
              dangerouslySetInnerHTML={{ __html: s.ta("news_text_3", "text") }}
            />
            <div className="ams-tt-list">
              {related.map((v) => (
                <NewsItem key={v.node_id} v={v} tag="h3" />
              ))}
            </div>
            <div className="ams-nd-all">
              <a href={s.u(catLink(cat))} className="ams-btn ams-btn-red">
                {t("news_text_4")}
                <svg width="17" height="14">
                  <use href="#i-arrow"></use>
                </svg>
              </a>
              <Adm m="lang" v="news_text_4" mode="text" />
            </div>
          </div>
        </section>
      )}

      <Links />
    </>
  );
}
