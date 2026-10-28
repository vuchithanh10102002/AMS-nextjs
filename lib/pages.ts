import "server-only";
import { notFound, redirect } from "next/navigation";
import { getModule } from "./modules/registry";
import { toClient } from "./modules/client";
import { can } from "./perm";
import { requireAdmin } from "./session";
import { getRecord, listRecords, type ListParams } from "./crud";
import { siteUrl } from "./site";

export async function loadList(key: string, sp: Record<string, string | string[] | undefined>) {
  const def = getModule(key);
  if (!def) notFound();
  const admin = await requireAdmin();
  if (!can(admin, def.perm ?? def.key, "list")) redirect("/admin?denied=1");
  const params: ListParams = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const [data, mod] = await Promise.all([listRecords(def, params, admin), toClient(def, admin)]);
  return { def, admin, module: mod, ...data, siteUrl: siteUrl() };
}

export async function loadRecord(key: string, idParam: string | null) {
  const def = getModule(key);
  if (!def) notFound();
  const admin = await requireAdmin();
  const id = idParam ? Number(idParam) : null;
  if (idParam && !Number.isInteger(id)) notFound();
  if (!can(admin, def.perm ?? def.key, id ? "edit" : "add") && !(id && can(admin, def.perm ?? def.key, "list")))
    redirect("/admin?denied=1");
  const values = id ? await getRecord(def, id, admin) : {};
  if (id && !values) notFound();
  const mod = await toClient(def, admin);
  const preview = id && def.previewLink && values?.slug ? `${siteUrl()}${values.slug}.html` : undefined;
  return { def, admin, module: mod, id, values: JSON.parse(JSON.stringify(values ?? {})), preview };
}
