export const LANGS = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "Tiếng Anh" },
] as const;

export type LangCode = (typeof LANGS)[number]["value"];

export const LANG_MODES = [
  { value: "text", label: "Chữ một dòng" },
  { value: "textarea", label: "Chữ nhiều dòng" },
  { value: "editor", label: "Soạn thảo HTML" },
  { value: "image", label: "Ảnh" },
  { value: "image_link", label: "Ảnh + link" },
  { value: "image_link_text", label: "Ảnh + link + tên + mô tả" },
  { value: "text_link", label: "Chữ + link" },
  { value: "textarea_link", label: "Chữ nhiều dòng + link" },
  { value: "category", label: "ID mục lục" },
] as const;

export type LangMode = (typeof LANG_MODES)[number]["value"];

export function isImageMode(m: LangMode) {
  return m === "image" || m === "image_link" || m === "image_link_text";
}

export function hasLink(m: LangMode) {
  return (
    m === "image_link" || m === "image_link_text" || m === "text_link" || m === "textarea_link"
  );
}

export function modeFromQuery(sp: Record<string, string | string[] | undefined>): LangMode | null {
  if (typeof sp.mode === "string" && LANG_MODES.some((m) => m.value === sp.mode))
    return sp.mode as LangMode;
  let found: LangMode | null = null;
  for (const m of LANG_MODES) if (m.value !== "text" && sp[m.value] !== undefined) found = m.value;
  return found;
}
