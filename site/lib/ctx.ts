import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { currentAdmin } from "@/lib/session";
import { getSettings } from "@/lib/site";
import { translator } from "./i18n";

const MODES = [
  "editor",
  "category",
  "image",
  "textarea",
  "image_link",
  "image_link_text",
  "text_link",
  "textarea_link",
];

export const isMobile = cache(async () =>
  /Mobile|Android|iP(hone|od)|IEMobile|Opera Mini/i.test((await headers()).get("user-agent") ?? ""),
);

export const editorOn = cache(
  async () =>
    (await cookies()).get("active_editor")?.value === "1" &&
    !!(await currentAdmin()) &&
    !(await isMobile()),
);

export const site = cache(async () => {
  const [tt, settings, editor, mobile] = await Promise.all([
    translator(),
    getSettings(),
    editorOn(),
    isMobile(),
  ]);
  const adm = (module: string, value: string | number, mode = "lang") => {
    if (!editor) return "";
    const href =
      module === "lang"
        ? `/admin/lang/${encodeURIComponent(String(value))}${MODES.includes(mode) ? `?${mode}=1` : ""}`
        : `/admin/${module}/${value}`;
    return `<a class="adm-glyphicon " href="${href}" target="_blank">
                    <span style="color: red;" class="fa fa-cog"></span>
                </a>`;
  };
  const ta = (key: string, mode?: string) => tt.t(key) + adm("lang", key, mode);
  return { ...tt, settings, editor, mobile, adm, ta };
});

export type Site = Awaited<ReturnType<typeof site>>;
