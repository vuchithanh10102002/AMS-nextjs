export function GET() {
  return new Response("User-agent: *\nCrawl-delay: 10\n# Directories\nDisallow: /admin/\nDisallow: /search/\nDisallow: /page:", {
    headers: { "Content-Type": "text/plain; charset=UTF-8" },
  });
}
