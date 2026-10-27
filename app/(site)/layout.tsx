import { headers } from "next/headers";
import { site } from "@/site/lib/ctx";
import { siteUrl } from "@/lib/site";
import { currentAdmin } from "@/lib/session";

const V = "1.0.6";
const CSS = [
  "css/bootstrap.min.css",
  "css/owl.carousel.min.css",
  "css/sweetalert.min.css",
  "css/fancybox.css",
  "plugins/sweetalert2/sweetalert2.min.css",
  "plugins/wow/animate.min.css",
  "style.css",
];
const JS = [
  "js/jquery.min.js",
  "js/bootstrap.min.js",
  "js/owl.carousel.min.js",
  "js/sweetalert.min.js",
  "plugins/sweetalert2/sweetalert2.min.js",
  "js/fancybox.js",
  "js/lazy.js",
  "js/number.min.js",
  "plugins/wow/wow.min.js",
  `app.js?v=${V}`,
];

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await site();
  const path = (await headers()).get("x-site-path") ?? "";
  const home = path === "/";
  const admin = !s.mobile && (await currentAdmin());
  const t = s.t;
  const boot = `const level = '';const IS_HOME = ${home ? 1 : 0};const IS_MOBILE = ${s.mobile ? 1 : 0};const DOMAIN = ${JSON.stringify(siteUrl())};const csrfToken = "";`;
  const tail = `const link_product = ${JSON.stringify(s.settings.link_category_product ?? "")};const colorButtonCancel = ${JSON.stringify(t("general_text_99"))};
var head = document.getElementsByTagName("head")[0];var is_loaded = 0;
function init_data(){if(is_loaded == 1) return false;var files = ${JSON.stringify(JS)};for (var file of files){var path = DOMAIN + "theme/default/" + file;if (file.indexOf("http://") == 0 || file.indexOf("https://") == 0) path = file;var s = document.createElement("script");s.src = path;s.async = false;head.append(s);}is_loaded = 1;}
document.getElementsByTagName("body")[0].addEventListener("${s.mobile ? "touchstart" : "mouseover"}", init_data);`;

  return (
    <html lang={s.lang === "en" ? "en" : "vi"}>
      <head>
        <meta name="format-detection" content="telephone=no" />
        <link rel="preload" href="/theme/default/fonts/PlusJakartaSans-vietnamese.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/theme/default/fonts/PlusJakartaSans-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        {CSS.map((c) => (
          <link key={c} rel="stylesheet" href={`/theme/default/${c}?v=${V}`} />
        ))}
        <link rel="stylesheet" href="/colors.css" />
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body
        className={`pc${home ? " ams-home" : ""}`}
        data-t-ok={t("general_text_33")}
        data-t-sent={t("general_text_34")}
        data-t-search={t("general_text_35")}
        data-t-invalid={t("general_text_36")}
        data-t-fail={t("general_text_37")}
        data-t-offline={t("general_text_38")}
        data-t-invalid_contact={t("contact_text_19")}
        data-t-copied={t("news_text_9")}
      >
        {admin && (
          <a href={`?active_editor=${s.editor ? 0 : 1}`} className="hidden-xs">
            <span className="btn btn-primary" style={{ position: "fixed", top: 31, right: 5, zIndex: 999998, background: "#cc002b", color: "#fff", padding: "4px 10px" }}>
              {s.editor ? "Tắt chế độ sửa" : "Bật chế độ sửa"}
            </span>
          </a>
        )}
        {children}
        <script dangerouslySetInnerHTML={{ __html: tail }} />
      </body>
    </html>
  );
}
