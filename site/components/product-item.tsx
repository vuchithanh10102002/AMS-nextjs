import { site } from "@/site/lib/ctx";
import type { ProductRow } from "@/site/lib/queries/node";
import { strip } from "@/site/lib/text";
import { link, src } from "@/site/lib/url";
import { Adm } from "./adm";

export async function ProductItem({ v, tag = "h2" }: { v: ProductRow; tag?: "h2" | "h3" }) {
  const s = await site();
  const href = link(v.slug);
  const name = s.tr(v, "title");
  const desc = s.tr(v, "description");
  const m = desc.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const use = strip(m ? m[1] : desc);
  const Tag = tag;
  return (
    <div className="ams-sp-card">
      <a href={href} className="ams-sp-img">
        {v.image ? <img src={src(v.image)} alt={name} loading="lazy" /> : null}
      </a>
      <Tag className="ams-sp-name">
        <a href={href}>{name}</a>
        <Adm m="product" v={v.node_id} />
      </Tag>
      <p className="ams-sp-desc" dangerouslySetInnerHTML={{ __html: use }} />
      <div className="ams-sp-btns">
        <a href={href} className="ams-sp-btn">
          {s.t("general_text_61")}
        </a>
        <button type="button" className="ams-sp-quote btn_quote" data-product={strip(name)}>
          {s.t("general_text_44")}
        </button>
      </div>
    </div>
  );
}
