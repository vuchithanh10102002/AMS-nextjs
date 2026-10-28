import { site } from "@/site/lib/ctx";
import { newsTags } from "@/site/lib/queries/news";
import type { NewsRow } from "@/site/lib/queries/node";
import { link, src } from "@/site/lib/url";
import { Adm } from "./adm";

export async function NewsItem({ v, tag = "h2" }: { v: NewsRow; tag?: "h2" | "h3" }) {
  const s = await site();
  const href = link(v.slug);
  const name = s.tr(v, "title");
  const tags = await newsTags(v.node_id);
  const Tag = tag;
  return (
    <div className="ams-tt-item">
      <a href={href} className="wrap-img img-100 ams-tt-img">
        {v.image ? <img src={src(v.image)} alt={name} loading="lazy" /> : null}
      </a>
      {tags.length > 0 && (
        <div className="ams-tt-tags">
          {tags.map((t, i) => (
            <span key={i}>{s.tr(t, "title")}</span>
          ))}
        </div>
      )}
      <Tag className="ams-tt-title">
        <a href={href}>{name}</a>
        <Adm m="news" v={v.node_id} />
      </Tag>
      <a href={href} className="ams-news-more">
        {s.t("home_text_18")}
        <svg width="10" height="10">
          <use href="#i-arrow-sm"></use>
        </svg>
      </a>
    </div>
  );
}
