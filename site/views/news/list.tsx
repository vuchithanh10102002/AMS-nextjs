import { redirect } from "next/navigation";
import { Hero } from "@/site/components/hero";
import { Links } from "@/site/components/links";
import { NewsItem } from "@/site/components/news-item";
import { Pager } from "@/site/components/pager";
import { site } from "@/site/lib/ctx";
import { crumbHtml } from "@/site/lib/crumb";
import type { Cat } from "@/site/lib/queries/category";
import { newsList } from "@/site/lib/queries/news";
import { outOfRange } from "@/site/lib/queries/paged";
import { queryString, type Query } from "@/site/lib/url";

export async function NewsList({
  cur,
  page,
  q,
  base,
}: {
  cur: Cat;
  page: number;
  q: Query;
  base: string;
}) {
  const s = await site();
  const data = await newsList(cur.id, page, 9);
  if (outOfRange(data)) redirect("/404.html");
  return (
    <>
      <Hero
        title={s.tr(cur.node, "title")}
        image={cur.image}
        cls="ams-hero-lg"
        crumbHtml={await crumbHtml(cur)}
      />
      <section className="ams-tt">
        <div className="wrap">
          {data.rows.length ? (
            <div className="ams-tt-list">
              {data.rows.map((v) => (
                <NewsItem key={v.node_id} v={v} />
              ))}
            </div>
          ) : (
            <div
              className="ams-sr-empty"
              dangerouslySetInnerHTML={{ __html: s.ta("general_text_43", "text") }}
            />
          )}
          <div className="ams-tt-pager">
            <Pager base={base} page={data.page} pages={data.pages} query={queryString(q)} />
          </div>
        </div>
      </section>
      <Links />
    </>
  );
}
