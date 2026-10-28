import { Adm } from "@/site/components/adm";
import { site } from "@/site/lib/ctx";
import { categoriesWhere } from "@/site/lib/queries/category";
import { catLink, src } from "@/site/lib/url";

export async function HomeCategories() {
  const [s, all] = await Promise.all([site(), categoriesWhere("home_menu")]);
  const { tr } = s;
  const cats = all.filter((c) => c.ctype === "product");
  if (!cats.length) return null;
  return (
    <section className="ams-index-cat">
      <div className="wrap">
        <h2
          className="ams-title wow animate__fadeInUp"
          dangerouslySetInnerHTML={{ __html: s.ta("home_text_5", "text") }}
        />
        <div className="container-fluid">
          <div className="row ams-index-cat-row">
            {cats.slice(0, 5).map((v, k) => (
              <div
                key={v.id}
                className="col-xs-6 col-sm-4 col-md-1-5 wow animate__fadeInUp"
                data-wow-delay={`${k / 10}s`}
              >
                <a href={catLink(v)} className="ams-index-cat-item">
                  <span className="wrap-img img-100">
                    <img src={src(v.image)} alt={tr(v.node, "title")} loading="lazy" />
                  </span>
                  <span className="ams-index-cat-name">{tr(v.node, "title")}</span>
                </a>
                <Adm m="category" v={v.node.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
