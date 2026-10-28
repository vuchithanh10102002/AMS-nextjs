import { Adm } from "@/site/components/adm";
import { site } from "@/site/lib/ctx";
import { strip } from "@/site/lib/text";
import { src } from "@/site/lib/url";

export async function HomeHero() {
  const s = await site();
  const { t } = s;
  return (
    <section className="ams-index-hero">
      <img
        src={src(t("home_tab_1"))}
        className="ams-index-hero-bg"
        alt={strip(t("home_text_1"))}
        width="1920"
        height="533"
        fetchPriority="high"
      />
      <Adm m="lang" v="home_tab_1" mode="image" />
      <div className="wrap">
        <div className="ams-index-hero-card">
          <h1
            className="ams-index-hero-title"
            dangerouslySetInnerHTML={{ __html: s.ta("home_text_1", "editor") }}
          />
          <p
            className="ams-index-hero-desc"
            dangerouslySetInnerHTML={{ __html: s.ta("home_text_2", "textarea") }}
          />
        </div>
      </div>
    </section>
  );
}
