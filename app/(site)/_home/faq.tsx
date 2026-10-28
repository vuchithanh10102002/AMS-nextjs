import { Adm } from "@/site/components/adm";
import { site } from "@/site/lib/ctx";
import { getFaqs } from "@/site/lib/queries/rows";

export async function HomeFaq() {
  const [s, faqs] = await Promise.all([site(), getFaqs(10)]);
  if (!faqs.length) return null;
  const { tr } = s;
  return (
    <section className="ams-index-faq">
      <div className="wrap">
        <h2
          className="ams-title wow animate__fadeInUp"
          dangerouslySetInnerHTML={{ __html: s.ta("home_text_19", "text") }}
        />
        <div className="ams-index-faq-list wow animate__fadeInUp">
          {faqs.map((v, k) => (
            <div key={v.id} className={`ams-faq-item${k === 0 ? " open" : ""}`}>
              <button type="button" className="ams-faq-head acc_head">
                <span className="ams-faq-q">{tr(v, "title")}</span>
                <span className="ams-faq-ico">
                  <svg width="16" height="16">
                    <use href="#i-plus"></use>
                  </svg>
                </span>
              </button>
              <Adm m="faq" v={v.id} />
              <div
                className="ams-faq-body"
                dangerouslySetInnerHTML={{ __html: tr(v, "content") }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
