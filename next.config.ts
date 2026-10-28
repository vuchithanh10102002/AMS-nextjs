import type { NextConfig } from "next";

const sitePath = (() => {
  try {
    return new URL(process.env.SITE_URL ?? "http://localhost/").pathname.replace(/\/+$/, "");
  } catch {
    return "";
  }
})();

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    site: { stale: 300, revalidate: 60, expire: 86400 },
  },
  experimental: {
    globalNotFound: true,
    serverActions: { bodySizeLimit: "20mb" },
  },
  env: { NEXT_PUBLIC_SITE_PATH: sitePath },
  async rewrites() {
    return [
      { source: `${sitePath}/app/webroot/uploads/:path*`, destination: "/media/:path*" },
      { source: `${sitePath}/uploads/:path*`, destination: "/media/:path*" },
    ];
  },
};

export default nextConfig;
