import { Adm } from "@/site/components/adm";
import { Hero, Links, Pager, ProductItem } from "@/site/components/blocks";
import { site } from "@/site/lib/ctx";
import { crumbHtml } from "@/site/lib/crumb";
import { catLink, categoryById, childrenOf, getHangs, getNodes, productList, src, type Cat } from "@/site/lib/data";

export type Query = Record<string, string | string[] | undefined>;

const one = (q: Query, k: string) => (Array.isArray(q[k]) ? q[k]![0] : q[k]) ?? "";
const ids = (v: string) => v.split(",").map((x) => parseInt(x, 10)).filter((x) => x > 0);

async function rootOf(cat: Cat): Promise<Cat> {
  const p = Number(cat.parent_id);
  if (p > 0) {
    const parent = await categoryById(p);
    if (parent) return rootOf(parent);
  }
  return cat;
}

export function queryString(q: Query) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) for (const x of Array.isArray(v) ? v : [v ?? ""]) u.append(k, x);
  return u.toString();
}

export async function ProductList({ cur, page, q, base }: { cur: Cat; page: number; q: Query; base: string }) {
  const s = await site();
  const { t, tr } = s;
  const root = await rootOf(cur);
  const rootLink = catLink(root);
  const groups = await childrenOf(root);
  const hangs = await getHangs();
  const selCat = ids(one(q, "cat"));
  const selBrand = ids(one(q, "brand"));
  if (groups.some((g) => g.id == cur.parent_id) && !selCat.includes(Number(cur.id))) selCat.push(Number(cur.id));
  const url = (c: number[], b: number[]) => {
    const parts = [];
    if (c.length) parts.push(`cat=${c.join(",")}`);
    if (b.length) parts.push(`brand=${b.join(",")}`);
    return parts.length ? `${rootLink}?${parts.join("&")}` : rootLink;
  };
  const toggle = (list: number[], id: number) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const items = Object.keys(q)
    .filter((k) => k.includes("item-"))
    .map((k) => parseInt(one(q, k).replace("item-", "").replace(/[^0-9]/g, ""), 10))
    .filter((x) => x > 0);
  const data = await productList(cur, { brand: one(q, "brand"), cat: one(q, "cat"), items, sort: one(q, "sort"), page }, 16);
  const facets = await Promise.all(
    groups.map(async (g) => ({
      g,
      items: await Promise.all((await childrenOf(g)).map(async (c) => ({ c, n: (await getNodes("product", { categoryId: c.id, limit: 1000 })).length }))),
    })),
  );
  const brandCounts = await Promise.all(
    hangs.map(async (h) => ({ h, n: (await getNodes("product", { categoryId: root.id, where: "m.hang_id = ?", params: [h.id], limit: 1000 })).length })),
  );
  const any = selCat.length > 0 || selBrand.length > 0;

  return (
    <>
      <Hero title={tr(cur.node, "title")} image={cur.image} desc={tr(cur, "description")} crumbHtml={await crumbHtml(cur)} />

      <section className="ams-sp">
        <div className="ams-sp-row">
          <aside className="ams-sp-side">
            <button type="button" className="ams-sp-filter btn_filter">
              <svg width="18" height="18"><use href="#i-menu"></use></svg>
              {t("general_text_56")}
              {any && <span className="ams-sp-filter-num">{selCat.length + selBrand.length}</span>}
            </button>
            <div className="ams-sp-side-in">
              {any ? (
                <a href={rootLink} className="ams-sp-clear" rel="nofollow">
                  <svg width="12" height="12"><use href="#i-x"></use></svg>
                  {t("general_text_47")}
                </a>
              ) : (
                <span className="ams-sp-clear ams-sp-clear-off">
                  <svg width="12" height="12"><use href="#i-x"></use></svg>
                  {t("general_text_47")}
                </span>
              )}
              <Adm m="lang" v="general_text_47" mode="text" />
              {facets
                .filter((f) => f.items.length)
                .map(({ g, items }) => (
                  <div key={g.id} className="ams-sp-facet open">
                    <button type="button" className="ams-sp-facet-head btn_facet">
                      {tr(g.node, "title")}
                      <svg width="10" height="7"><use href="#i-chev"></use></svg>
                    </button>
                    <Adm m="category" v={g.node.id} />
                    <div className="ams-sp-facet-body">
                      <ul className="ams-sp-facet-list">
                        {items.map(({ c, n }) => {
                          const id = Number(c.id);
                          return (
                            <li key={id}>
                              <a href={url(toggle(selCat, id), selBrand)} rel="nofollow" className={selCat.includes(id) ? "active" : undefined}>
                                <span className="ams-sp-tick"></span>
                                <span>{tr(c.node, "title")}</span>
                                <em>{n}</em>
                              </a>
                              <Adm m="category" v={c.node.id} />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                ))}
              {hangs.length > 0 && (
                <div className="ams-sp-facet open">
                  <button type="button" className="ams-sp-facet-head btn_facet">
                    {t("general_text_58")}
                    <svg width="10" height="7"><use href="#i-chev"></use></svg>
                  </button>
                  <div className="ams-sp-facet-body">
                    <ul className="ams-sp-facet-list">
                      {brandCounts
                        .filter((b) => b.n > 0)
                        .map(({ h, n }) => {
                          const id = Number(h.id);
                          return (
                            <li key={id}>
                              <a href={url(selCat, toggle(selBrand, id))} rel="nofollow" className={selBrand.includes(id) ? "active" : undefined}>
                                <span className="ams-sp-tick"></span>
                                <span>{h.title}</span>
                                <em>{n}</em>
                              </a>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </aside>
          <div className="ams-sp-main">
            {data.rows.length ? (
              <div className="ams-sp-grid">
                <div className="row clearfix">
                  {data.rows.map((v) => (
                    <div key={v.node_id} className="ams-sp-col">
                      <ProductItem v={v} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ams-sr-empty" dangerouslySetInnerHTML={{ __html: s.ta("general_text_42", "text") }} />
            )}
            <Pager base={base} page={data.page} pages={data.pages} query={queryString(q)} />
          </div>
        </div>
      </section>

      {hangs.length > 0 && (
        <section className="ams-sp-brands">
          <div className="wrap">
            <h2 className="ams-title" dangerouslySetInnerHTML={{ __html: s.ta("general_text_64", "text") }} />
            <div className="row clearfix">
              {hangs.slice(0, 3).map((h) => (
                <div key={h.id} className="ams-sp-brand-lg">
                  <a href={`${rootLink}?brand=${h.id}`} className="ams-sp-brand-box">
                    {h.image ? <img src={src(h.image)} alt={h.title} loading="lazy" /> : null}
                  </a>
                  <Adm m="hang" v={h.id} />
                </div>
              ))}
            </div>
            <div className="row clearfix">
              {hangs.slice(3).map((h) => (
                <div key={h.id} className="ams-sp-brand-sm">
                  <a href={`${rootLink}?brand=${h.id}`} className="ams-sp-brand-box">
                    {h.image ? <img src={src(h.image)} alt={h.title} loading="lazy" /> : null}
                  </a>
                  <Adm m="hang" v={h.id} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Links />
    </>
  );
}
