export function GET() {
  return new Response("Not Found", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=UTF-8" },
  });
}
