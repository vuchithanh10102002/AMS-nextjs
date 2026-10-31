import type { Metadata } from "next";
import { Hero } from "@/site/components/hero";
import { Shell } from "@/site/components/layout/shell";
import { site } from "@/site/lib/ctx";
import { pageMeta } from "@/site/lib/meta";

export async function generateMetadata(): Promise<Metadata> {
  const s = await site();
  return pageMeta({
    title: s.settings.title,
    description: s.settings.description,
    keywords: s.settings.keyword,
    path: "/lien-he",
  });
}

export default async function ContactPage() {
  const s = await site();
  const { t } = s;
  const title = t("contact_text_1");
  return (
    <Shell here={{ contact: true }}>
      <Hero
        title={title}
        image={t("contact_text_2")}
        crumbs={[
          { link: s.home, title: t("header_text_5") },
          { link: "", title },
        ]}
      />
      <section className="ams-lh">
        <div className="wrap clearfix">
          <div className="ams-lh-form-col">
            <div className="ams-lh-form-box">
              <h2
                className="ams-lh-form-title"
                dangerouslySetInnerHTML={{ __html: s.ta("contact_text_3", "text") }}
              />
              <form
                className="ams-form ams-lh-form form_contact clearfix"
                action="/contact"
                method="post"
                noValidate
              >
                <div className="ams-field ams-lh-half">
                  <label className="ams-lh-label" htmlFor="lh-first">
                    {t("contact_text_6")}
                    <span>*</span>
                  </label>
                  <input id="lh-first" type="text" name="first_name" required />
                </div>
                <div className="ams-field ams-lh-half">
                  <label className="ams-lh-label" htmlFor="lh-last">
                    {t("contact_text_7")}
                    <span>*</span>
                  </label>
                  <input id="lh-last" type="text" name="last_name" required />
                </div>
                <div className="ams-field ams-lh-full">
                  <label className="ams-lh-label" htmlFor="lh-email">
                    {t("contact_text_9")}
                    <span>*</span>
                  </label>
                  <input id="lh-email" type="email" name="email" required />
                </div>
                <div className="ams-field ams-lh-full">
                  <label className="ams-lh-label" htmlFor="lh-subject">
                    {t("contact_text_5")}
                  </label>
                  <input id="lh-subject" type="text" name="subject" />
                </div>
                <div className="ams-field ams-lh-full">
                  <label className="ams-lh-label" htmlFor="lh-content">
                    {t("contact_text_12")}
                    <span>*</span>
                  </label>
                  <textarea id="lh-content" name="content" rows={6} required></textarea>
                </div>
                <div className="ams-lh-full">
                  <button type="submit" className="ams-btn ams-btn-red btn_cho_js" disabled>
                    {t("contact_text_13")}
                    <svg width="17" height="14">
                      <use href="#i-arrow"></use>
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="ams-lh-info">
            <div className="ams-lh-hotline">
              <h2
                className="ams-lh-info-title"
                dangerouslySetInnerHTML={{ __html: s.ta("contact_text_17", "text") }}
              />
              <div
                className="ams-lh-hotline-list"
                dangerouslySetInnerHTML={{ __html: s.ta("contact_text_18", "editor") }}
              />
            </div>
            <div
              className="ams-lh-office"
              dangerouslySetInnerHTML={{ __html: s.ta("contact_text_16", "editor") }}
            />
          </div>
        </div>
      </section>
    </Shell>
  );
}
