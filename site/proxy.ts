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
  const en = pathname === "/en" || pathname.startsWith("/en/");
  const path = en ? pathname.slice(3) || "/" : pathname;
  if (lang === "vi" || lang === "en") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    url.pathname = lang === "en" ? (path === "/" ? "/en" : "/en" + path) : path;
    const res = NextResponse.redirect(url, 301);
    res.cookies.delete("lang");
    return res;
  }
  const headers = new Headers(request.headers);
  headers.set("x-site-path", path);
  headers.set("x-site-search", request.nextUrl.search);
  headers.set("x-site-lang", en ? "en" : "vi");
  if (!en) return NextResponse.next({ request: { headers } });
  const url = request.nextUrl.clone();
  url.pathname = path;
  return NextResponse.rewrite(url, { request: { headers } });
}
