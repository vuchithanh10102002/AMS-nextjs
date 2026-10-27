import { site } from "@/site/lib/ctx";
import { catLink, categoryByTemplate, childrenOf, getHangs, menuRoots, src, type Cat } from "@/site/lib/data";
import { Adm } from "./adm";

export type Here = { home?: boolean; contact?: boolean; cur?: Cat | null; search?: string };

function langLink(s: string) {
  return s === "" || s === "#" || s.includes(":") ? s : "/" + s.replace(/^\/+/, "");
}

export async function Header({ here }: { here: Here }) {
  const s = await site();
  const { t, tr } = s;
  const cur = here.cur && here.cur.lft != null && here.cur.id ? here.cur : null;
  const en = s.lang === "en";
  const roots = await menuRoots();
  const subs = await Promise.all(roots.map((v) => childrenOf(v)));
  const th = await categoryByTemplate("thuong-hieu");
  const hangs = await getHangs();
  const grand = new Map<number, Cat[]>();
  for (const [i, v] of roots.entries()) if (subs[i].length && v.ctype === "product") for (const c of subs[i]) grand.set(c.id, await childrenOf(c));

  return (
    <>
      <div className="ams-topbar">
        <div className="wrap clearfix">
          <p className="ams-topbar-slogan" dangerouslySetInnerHTML={{ __html: s.ta("slogan", "text") }} />
          <ul className="ams-topbar-links">
            {[1, 2, 3].map((i) => (
              <li key={i}>
                <a href={langLink(t(`header_text_${i}_link`))}>{t(`header_text_${i}`)}</a>
                <Adm m="lang" v={`header_text_${i}`} mode="text_link" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ams-header-slot">
        <header className="ams-header">
          <div className="ams-header-main">
            <div className="wrap clearfix">
              <button type="button" className="ams-btn-menu btn_menu" aria-label={t("general_text_24")}>
                <svg width="24" height="24"><use href="#i-menu"></use></svg>
              </button>
              <a href="/" className="ams-logo">
                <img src={src(t("logo_header"))} alt={s.settings.title} width="272" height="44" data-eager="1" />
              </a>
              <Adm m="lang" v="logo_header" mode="image" />
              <form className="ams-search form_search" action="/search" method="get" noValidate>
                <input type="text" name="s" defaultValue={here.search ?? ""} placeholder={t("search_key")} autoComplete="off" />
                <button type="submit" aria-label={t("general_text_25")}>
                  <svg width="21" height="21"><use href="#i-search"></use></svg>
                </button>
              </form>
              <Adm m="lang" v="search_key" mode="text" />
              <button type="button" className="ams-btn-quote btn_quote">{t("header_text_4")}</button>
              <Adm m="lang" v="header_text_4" mode="text" />
              <div className="ams-lang lang_box">
                <button type="button" className="ams-lang-toggle lang_toggle">
                  <svg className="ams-flag" width="20" height="13"><use href={`#i-flag-${en ? "en" : "vn"}`}></use></svg>
                  <span className="ams-lang-name">{en ? "EN" : "VN"}</span>
                  <svg className="ams-lang-down" width="8" height="5"><use href="#i-chev"></use></svg>
                </button>
                <ul className="ams-lang-menu">
                  <li className={en ? undefined : "active"}>
                    <a href="?lang=vi" className="lang_item" data-lang="VN" hrefLang="vi">
                      <svg className="ams-flag" width="20" height="13"><use href="#i-flag-vn"></use></svg>Tiếng Việt
                    </a>
                  </li>
                  <li className={en ? "active" : undefined}>
                    <a href="?lang=en" className="lang_item" data-lang="EN" hrefLang="en">
                      <svg className="ams-flag" width="20" height="13"><use href="#i-flag-en"></use></svg>English
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <nav className="ams-nav">
            <div className="wrap">
              <ul className="ams-nav-list">
                <li className={here.home ? "active" : undefined}>
                  <a href="/">{t("header_text_5")}</a>
                  <Adm m="lang" v="header_text_5" mode="text" />
                </li>
                {roots.map((v, i) => {
                  const sub = subs[i];
                  const on = cur && cur.lft >= v.lft && cur.rght <= v.rght;
                  const mega = sub.length > 0 && v.ctype === "product";
                  const cls = [on ? "active" : "", sub.length ? "ams-has-sub" : "", mega ? "ams-has-mega" : ""].filter(Boolean).join(" ");
                  return (
                    <li key={v.id} className={cls}>
                      <a href={catLink(v)}>
                        {tr(v.node, "title")}
                        {sub.length > 0 && (
                          <svg className="ams-nav-down" width="8" height="5"><use href="#i-chev"></use></svg>
                        )}
                      </a>
                      <Adm m="category" v={v.node.id} />
                      {mega ? (
                        <div className="ams-nav-mega">
                          {sub.map((c) => (
                            <div key={c.id} className="ams-nav-mega-col">
                              <a href={catLink(c)} className="ams-nav-mega-head">{tr(c.node, "title")}</a>
                              <Adm m="category" v={c.node.id} />
                              <ul className="ams-nav-mega-list">
                                {(grand.get(c.id) ?? []).map((g) => (
                                  <li key={g.id} className={cur && cur.id == g.id ? "active" : undefined}>
                                    <a href={catLink(g)}>{tr(g.node, "title")}</a>
                                    <Adm m="category" v={g.node.id} />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          {hangs.length > 0 && (
                            <div className="ams-nav-mega-col ams-nav-mega-brand">
                              <a href={th ? catLink(th) : catLink(v)} className="ams-nav-mega-head">{t("general_text_58")}</a>
                              <Adm m="lang" v="general_text_58" mode="text" />
                              <ul className="ams-nav-mega-list">
                                {hangs.map((h) => (
                                  <li key={h.id}>
                                    <a href={`${catLink(v)}?brand=${h.id}`}>{h.title}</a>
                                    <Adm m="hang" v={h.id} />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : sub.length > 0 ? (
                        <ul className="ams-nav-sub">
                          {sub.map((c) => (
                            <li key={c.id} className={cur && cur.id == c.id ? "active" : undefined}>
                              <a href={catLink(c)}>{tr(c.node, "title")}</a>
                              <Adm m="category" v={c.node.id} />
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
                <li className={here.contact ? "active" : undefined}>
                  <a href="/lien-he">{t("header_text_6")}</a>
                  <Adm m="lang" v="header_text_6" mode="text" />
                </li>
              </ul>
            </div>
          </nav>
        </header>
      </div>
    </>
  );
}
