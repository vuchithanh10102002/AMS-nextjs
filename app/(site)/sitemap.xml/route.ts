import { query } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const FREQ: Record<string, [string, string]> = { category: ["weekly", "0.6"], news: ["monthly", "0.2"] };

const stamp = (t: unknown) => new Date((Number(t) + 7 * 3600) * 1000).toISOString().slice(0, 16) + "Z";

export async function GET() {
  const base = siteUrl();
  const rows = await query<{ slug: string; type: string; modified: number }>(
    "SELECT slug, type, modified FROM nodes WHERE status = 1 AND type IN ('news', 'category', 'product') ORDER BY id DESC",
  );
  const urls = rows.map((r) => {
    const f = FREQ[r.type];
    return `<url><loc>${base}${r.slug}.html</loc><lastmod>${stamp(r.modified)}</lastmod>${f ? `<changefreq>${f[0]}</changefreq><priority>${f[1]}</priority>` : ""}</url>`;
  });
  const home = `<url><loc>${base}</loc><lastmod>${stamp(rows[0]?.modified)}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`;
  const xml = `<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${home}${urls.join("")}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=UTF-8" } });
}
