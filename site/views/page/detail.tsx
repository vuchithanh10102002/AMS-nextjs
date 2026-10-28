import { Hero } from "@/site/components/hero";
import { Links } from "@/site/components/links";
import { site } from "@/site/lib/ctx";
import { crumbHtml } from "@/site/lib/crumb";
import type { Cat } from "@/site/lib/queries/category";

export async function PageDetail({ cur }: { cur: Cat }) {
  const s = await site();
  return (
    <>
      <Hero title={s.tr(cur.node, "title")} image={cur.image} crumbHtml={await crumbHtml(cur)} />
      <section className="ams-pg">
        <div className="wrap">
          <div
            className="ams-content"
            dangerouslySetInnerHTML={{
              __html: `<h2 class="ams-pg-title">${s.tr(cur.node, "title")}${s.adm("category", cur.node.id)}</h2>${s.tr(cur, "content")}`,
            }}
          />
        </div>
      </section>
      <Links />
    </>
  );
}
