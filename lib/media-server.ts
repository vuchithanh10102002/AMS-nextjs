import "server-only";
import path from "node:path";
import { UPLOAD_PREFIX } from "./media";

export function uploadsRoot() {
  const root = process.env.CK2_ROOT;
  if (!root) throw new Error("Thiếu CK2_ROOT trong .env");
  return path.resolve(root, UPLOAD_PREFIX);
}

export function resolveInUploads(rel: string) {
  const root = uploadsRoot();
  const clean = rel.replace(/^\/+/, "").replace(/^(app\/webroot\/)?uploads\/?/, "");
  const abs = path.resolve(root, clean);
  if (abs !== root && !abs.startsWith(root + path.sep)) throw new Error("Đường dẫn không hợp lệ");
  return { abs, rel: path.relative(root, abs).split(path.sep).join("/") };
}

export const ALLOWED_EXT = /\.(jpe?g|png|gif|webp|svg|bmp|avif|ico|pdf|docx?|xlsx?|pptx?|txt|csv|zip|rar|mp4|webm|mp3)$/i;

export function safeFileName(name: string) {
  const ext = path.extname(name).toLowerCase();
  const base = path
    .basename(name, path.extname(name))
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (base || "file") + ext;
}
