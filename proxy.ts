import { NextResponse, type NextRequest } from "next/server";
import { siteProxy } from "@/site/proxy";

export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!request.cookies.has("nh_admin")) return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.next();
  }
  return siteProxy(request);
}

export const config = {
  matcher: ["/((?!_next/|api/|media/|app/webroot/|theme/|favicon|[^?]*\\.(?:css|js|map|jpe?g|png|gif|webp|svg|ico|woff2?|ttf|txt|xml|webmanifest)$).*)"],
};
