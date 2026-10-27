import { NextResponse, type NextRequest } from "next/server";

export function siteProxy(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl;
  const lang = searchParams.get("lang");
  const editor = searchParams.get("active_editor");
  if (editor === "0" || editor === "1") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("active_editor");
    const res = NextResponse.redirect(url);
    res.cookies.set("active_editor", editor, { path: "/", sameSite: "lax" });
    return res;
  }
  const headers = new Headers(request.headers);
  headers.set("x-site-path", pathname);
  if (lang === "vi" || lang === "en") headers.set("x-site-lang", lang);
  const res = NextResponse.next({ request: { headers } });
  if (lang === "vi" || lang === "en") res.cookies.set("lang", lang, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return res;
}
