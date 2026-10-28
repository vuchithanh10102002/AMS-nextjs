import { site } from "@/site/lib/ctx";
import { categoriesWhere, categoryByTemplate, childrenOf, menuRoots } from "@/site/lib/queries/category";
import { getHangs } from "@/site/lib/queries/rows";
import { catLink, src } from "@/site/lib/url";
import { ICONS, SPRITE, VIDEO_MODAL } from "@/site/static/tail";
import { Adm } from "@/site/components/adm";
import type { Here } from "./header";

function langLink(s: string) {
  return s.includes(":") ? s : "/" + s.replace(/^\/+/, "");
}

export async function Footer({ here }: { here: Here }) {
  const s = await site();
  const { t, tr, settings } = s;
  const tel = t("company_hotline").replace(/[^0-9+]/g, "");
  const cols = await Promise.all(([1, 2, 3, 4] as const).map((i) => categoriesWhere(`footer_${i}`)));
  const roots = await menuRoots();
  const subs = await Promise.all(roots.map((v) => childrenOf(v)));
  const th = await categoryByTemplate("thuong-hieu");
  const hangs = await getHangs();
  const sub3 = new Map<number, Awaited<ReturnType<typeof childrenOf>>>();
  for (const [i, v] of roots.entries()) if (v.ctype === "product") for (const c of subs[i]) sub3.set(c.id, await childrenOf(c));

  return (
    <>
      <footer className="ams-footer">
        <div className="ams-footer-main">
          <div className="wrap">
            <div className="ams-footer-inner clearfix">
              <div className="ams-footer-info">
                <a href="/" className="ams-footer-logo">
                  <img src={src(t("logo_footer"))} alt={settings.title} width="80" height="80" loading="lazy" />
                </a>
                <Adm m="lang" v="logo_footer" mode="image" />
                <div className="ams-footer-company" dangerouslySetInnerHTML={{ __html: s.ta("company_name", "text") }} />
                <p className="ams-footer-addr" dangerouslySetInnerHTML={{ __html: `<svg width="16" height="20"><use href="#i-pin"></use></svg>${s.ta("company_address", "text")}` }} />
                <a href={`tel:${tel}`} className="ams-footer-phone">
                  <svg width="17" height="17"><use href="#i-call"></use></svg>
                  {t("company_hotline")}
                </a>
                <Adm m="lang" v="company_hotline" mode="text" />
                <a href={`mailto:${t("company_email")}`} className="ams-footer-mail">
                  <svg width="17" height="14"><use href="#i-mail"></use></svg>
                  {t("company_email")}
                </a>
                <Adm m="lang" v="company_email" mode="text" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className={`ams-footer-col${i === 3 ? " ams-footer-col-last" : ""}`}>
                  <div className="ams-footer-title" dangerouslySetInnerHTML={{ __html: s.ta(`footer_tab_${i}`, "text") }} />
                  <ul>
                    {cols[i - 1].map((v) => (
                      <li key={v.id}>
                        <a href={catLink(v)}>{tr(v.node, "title")}</a>
                        <Adm m="category" v={v.node.id} />
                      </li>
                    ))}
                  </ul>
                  {i === 3 && (
                    <div className="ams-social">
                      {settings.facebook && (
                        <a href={settings.facebook} className="ams-social-fb" aria-label="Facebook" target="_blank" rel="noopener">
                          <svg width="8" height="15"><use href="#i-fb"></use></svg>
                        </a>
                      )}
                      {settings.linkedin && (
                        <a href={settings.linkedin} className="ams-social-in" aria-label="LinkedIn" target="_blank" rel="noopener">
                          <svg width="15" height="14"><use href="#i-in"></use></svg>
                        </a>
                      )}
                      {settings.youtube && (
                        <a href={settings.youtube} className="ams-social-yt" aria-label="YouTube" target="_blank" rel="noopener">
                          <svg width="15" height="11"><use href="#i-yt"></use></svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="ams-footer-bottom">
          <div className="wrap">
            <div className="ams-footer-inner clearfix">
              <div className="ams-copy" dangerouslySetInnerHTML={{ __html: s.ta("copyright", "text") }} />
              <ul className="ams-footer-policy">
                {cols[3].map((v) => (
                  <li key={v.id}>
                    <a href={catLink(v)}>{tr(v.node, "title")}</a>
                    <Adm m="category" v={v.node.id} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <div className="ams-overlay mm_overlay"></div>
      <nav className="ams-mm">
        <div className="ams-mm-head clearfix">
          <a href="/" className="ams-mm-logo">
            <img src={src(t("logo_header"))} alt={settings.title} width="198" height="32" loading="lazy" />
          </a>
          <button type="button" className="ams-mm-close btn_mm_close" aria-label={t("general_text_26")}>
            <svg width="16" height="16"><use href="#i-x"></use></svg>
          </button>
        </div>
        <ul className="ams-mm-list">
          <li className={here.home ? "active" : undefined}>
            <a href="/">{t("header_text_5")}</a>
          </li>
          {roots.map((v, i) => {
            const sub = subs[i];
            return (
              <li key={v.id} className={sub.length ? "ams-mm-has" : undefined}>
                <a href={catLink(v)}>{tr(v.node, "title")}</a>
                {sub.length > 0 && (
                  <>
                    <button type="button" className="ams-mm-toggle mm_toggle" aria-label={t("general_text_27")}>
                      <svg width="10" height="6"><use href="#i-chev"></use></svg>
                    </button>
                    <ul className="ams-mm-child">
                      {sub.map((c) => {
                        const s3 = sub3.get(c.id) ?? [];
                        return (
                          <li key={c.id} className={s3.length ? "ams-mm-has" : undefined}>
                            <a href={catLink(c)}>{tr(c.node, "title")}</a>
                            {s3.length > 0 && (
                              <>
                                <button type="button" className="ams-mm-toggle mm_toggle" aria-label={t("general_text_27")}>
                                  <svg width="10" height="6"><use href="#i-chev"></use></svg>
                                </button>
                                <ul className="ams-mm-child">
                                  {s3.map((g) => (
                                    <li key={g.id}>
                                      <a href={catLink(g)}>{tr(g.node, "title")}</a>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </li>
                        );
                      })}
                      {v.ctype === "product" && hangs.length > 0 && (
                        <li className="ams-mm-has">
                          <a href={th ? catLink(th) : catLink(v)}>{t("general_text_58")}</a>
                          <button type="button" className="ams-mm-toggle mm_toggle" aria-label={t("general_text_27")}>
                            <svg width="10" height="6"><use href="#i-chev"></use></svg>
                          </button>
                          <ul className="ams-mm-child">
                            {hangs.map((h) => (
                              <li key={h.id}>
                                <a href={`${catLink(v)}?brand=${h.id}`}>{h.title}</a>
                              </li>
                            ))}
                          </ul>
                        </li>
                      )}
                    </ul>
                  </>
                )}
              </li>
            );
          })}
          <li className={here.contact ? "active" : undefined}>
            <a href="/lien-he">{t("header_text_6")}</a>
          </li>
        </ul>
        <ul className="ams-mm-sub">
          {[2, 3].map((i) => (
            <li key={i}>
              <a href={langLink(t(`header_text_${i}_link`))}>{t(`header_text_${i}`)}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="ams-popup quote_popup">
        <div className="ams-popup-box">
          <button type="button" className="ams-popup-close btn_popup_close" aria-label={t("general_text_28")}>
            <svg width="16" height="16"><use href="#i-x"></use></svg>
          </button>
          <div className="ams-popup-title" dangerouslySetInnerHTML={{ __html: s.ta("general_text_44", "text") }} />
          <p className="ams-popup-desc" dangerouslySetInnerHTML={{ __html: s.ta("general_text_45", "textarea") }} />
          <form className="ams-form form_quote" action="/contact" method="post" noValidate>
            <div className="ams-field"><input type="text" name="fullname" placeholder={t("general_text_21")} required /></div>
            <div className="ams-field"><input type="tel" name="phone" placeholder={t("general_text_22")} required /></div>
            <div className="ams-field"><input type="email" name="email" placeholder="Email" /></div>
            <div className="ams-field"><textarea name="content" rows={4} placeholder={t("general_text_23")}></textarea></div>
            <input type="hidden" name="product" value="" />
            <button type="submit" className="ams-btn ams-btn-red btn_cho_js" disabled>
              {t("general_text_46")}
              <svg width="17" height="14"><use href="#i-arrow"></use></svg>
            </button>
          </form>
        </div>
      </div>

      <div className="ams-float">
        <a href={`mailto:${t("company_email")}`} className="ams-float-btn">
          <svg width="17" height="14"><use href="#i-mail"></use></svg>Email
        </a>{" "}
        <a href={`tel:${tel}`} className="ams-float-btn">
          <svg width="17" height="17"><use href="#i-call"></use></svg>
          {t("general_text_66")}
        </a>
      </div>

      <div className="ams-quick">
        <a href={`tel:${tel}`} className="ams-quick-btn ams-quick-phone" aria-label={t("general_text_66")}>
          <svg width="18" height="18"><use href="#i-call"></use></svg>
        </a>
        {settings.zalo && (
          <a href={settings.zalo} className="ams-quick-btn ams-quick-zalo" target="_blank" rel="noopener" aria-label="Zalo">
            <svg width="23" height="21"><use href="#i-zalo"></use></svg>
          </a>
        )}
        <a href={`mailto:${t("company_email")}`} className="ams-quick-btn ams-quick-mail" aria-label="Email">
          <svg width="18" height="15"><use href="#i-mail"></use></svg>
        </a>
        <button type="button" className="ams-quick-btn ams-quick-top btn_top" aria-label={t("general_text_10")}>
          <svg width="21" height="12"><use href="#i-up"></use></svg>
        </button>
      </div>

      <div className="modal fade" id="video-modal" tabIndex={-1} role="dialog" dangerouslySetInnerHTML={{ __html: VIDEO_MODAL }} />
      <div className="svg-use hide" dangerouslySetInnerHTML={{ __html: ICONS }} />
      <div className="svg-use" dangerouslySetInnerHTML={{ __html: SPRITE }} />
    </>
  );
}
