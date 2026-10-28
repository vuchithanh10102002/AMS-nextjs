import "server-only";
import { categoryOptions } from "@/lib/categories";
import { can } from "@/lib/perm";
import type { Admin } from "@/lib/session";
import type { ClientModule, ModuleDef, Option } from "./types";

export async function toClient(def: ModuleDef, admin: Admin): Promise<ClientModule> {
  const cache = new Map<string, Option[]>();
  const resolve = async (key?: string, ctype?: string | string[], fixed?: Option[]) => {
    if (fixed) return fixed;
    const k = key ?? (ctype !== undefined ? `cat:${[ctype].flat().join(",")}` : "");
    if (!k) return undefined;
    if (!cache.has(k))
      cache.set(k, key ? ((await def.options?.[key]?.()) ?? []) : await categoryOptions(ctype));
    return cache.get(k);
  };
  const perm = def.perm ?? def.key;
  const fields = await Promise.all(
    (def.form?.fields ?? []).map(async ({ optionsKey, ...f }) => ({
      ...f,
      options: await resolve(
        optionsKey,
        f.type === "categories" ? (f.ctype ?? "") : undefined,
        f.options,
      ),
    })),
  );
  const filters = await Promise.all(
    (def.list.filters ?? []).map(async (f) => {
      if (f.kind === "select")
        return { ...f, options: await resolve(f.optionsKey, undefined, f.options) };
      if (f.kind === "category") return { ...f, options: await resolve(undefined, f.ctype ?? "") };
      return f;
    }),
  );
  return {
    key: def.key,
    title: def.title,
    node: !!def.node,
    adds: def.adds ?? true,
    edits: def.edits ?? true,
    deletes: def.deletes ?? true,
    copies: def.copies ?? false,
    positions: def.positions ?? false,
    statusToggle: def.statusToggle ?? false,
    previewLink: def.previewLink ?? false,
    columns: def.list.columns,
    filters,
    toggles: def.list.toggles ?? [],
    tabs: def.form?.tabs ?? [],
    fields,
    can: {
      add: can(admin, perm, "add"),
      edit: can(admin, perm, "edit"),
      delete: can(admin, perm, "delete"),
    },
  };
}
