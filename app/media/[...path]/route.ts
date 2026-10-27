import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveInUploads } from "@/lib/media-server";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
};

export async function GET(_: Request, ctx: RouteContext<"/media/[...path]">) {
  const { path: parts } = await ctx.params;
  try {
    const { abs } = resolveInUploads(parts.map(decodeURIComponent).join("/"));
    const data = await readFile(abs);
    const type = TYPES[path.extname(abs).toLowerCase()] ?? "application/octet-stream";
    return new Response(data, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=3600",
        ...(type === "image/svg+xml" ? { "Content-Security-Policy": "script-src 'none'" } : {}),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
