export const UPLOAD_PREFIX = "app/webroot/uploads/";

export function normalizeMediaPath(value: string) {
  const v = value.trim();
  if (!v) return "";
  if (/^(https?:)?\/\//.test(v)) return v;
  const i = v.indexOf(UPLOAD_PREFIX);
  return i >= 0 ? v.slice(i) : v.replace(/^\/+/, "");
}

export function previewUrl(value?: string | null) {
  if (!value) return "";
  const v = value.trim();
  if (/^(https?:)?\/\//.test(v) || v.startsWith("data:")) return v;
  return "/media/" + normalizeMediaPath(v);
}

export function isImage(path: string) {
  return /\.(jpe?g|png|gif|webp|svg|bmp|avif)$/i.test(path);
}
