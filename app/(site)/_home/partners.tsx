import { Adm } from "@/site/components/adm";
import { site } from "@/site/lib/ctx";
import { featuredHangs } from "@/site/lib/queries/rows";
import { src } from "@/site/lib/url";

export async function HomePartners() {
  const [s, partners] = await Promise.all([site(), featuredHangs(12)]);
  return (
    <section className="ams-index-partner">
      <div className="wrap">
        <h2 className="ams-title wow animate__fadeInUp" dangerouslySetInnerHTML={{ __html: s.ta("home_text_9", "text") }} />
        <p className="ams-index-partner-desc wow animate__fadeInUp" dangerouslySetInnerHTML={{ __html: s.ta("home_text_10", "textarea") }} />
        {partners.length > 0 && (
          <div className="ams-index-partner-list wow animate__fadeInUp" data-wow-delay="0.1s">
            <div className="owl-carousel partner_slider ams-dot-slider">
              {partners.map((v) => (
                <div key={v.id} className="ams-index-partner-cell">
                  <a
                    href={v.website || undefined}
                    className="ams-index-partner-item"
                    {...(v.website ? { target: "_blank", rel: "noopener" } : {})}
                  >
                    <img src={src(v.image)} alt={v.title ?? undefined} loading="lazy" />
                  </a>
                  <Adm m="hang" v={v.id} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
