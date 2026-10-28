"use server";

import { revalidatePath, updateTag } from "next/cache";
import { authorize } from "@/lib/perm";
import { copyRecord, deleteRecords, saveRecord, savePositions, toggleField } from "@/lib/crud";
import { getModule } from "@/lib/modules/registry";
import { getSettings } from "@/lib/site";

export type SaveState = {
  ok?: boolean;
  error?: string;
  message?: string;
  redirect?: string;
  at?: number;
};

function mod(key: string) {
  const def = getModule(key);
  if (!def) throw new Error("Module không tồn tại");
  return def;
}

function fail(e: unknown): SaveState {
  return { error: e instanceof Error ? e.message : "Có lỗi xảy ra", at: Date.now() };
}

export async function saveAction(
  key: string,
  id: number | null,
  _: SaveState,
  form: FormData,
): Promise<SaveState> {
  try {
    const def = mod(key);
    const admin = await authorize(def.perm ?? def.key, id ? "edit" : "add");
    const newId = await saveRecord(def, id, form, admin);
    revalidatePath(`/admin/${key}`, "layout");
    updateTag("site");
    const settings = await getSettings();
    const next = id ? settings.continueEdit || "edit" : settings.continueAdd || "edit";
    const base = `/admin/${key}`;
    const redirect = next === "list" ? base : next === "add" ? `${base}/add` : `${base}/${newId}`;
    return {
      ok: true,
      message: id ? "Đã sửa" : "Đã thêm",
      redirect: id && next === "edit" ? undefined : redirect,
      at: Date.now(),
    };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteAction(key: string, ids: number[]) {
  try {
    const def = mod(key);
    const admin = await authorize(def.perm ?? def.key, "delete");
    await deleteRecords(def, ids, admin);
    revalidatePath(`/admin/${key}`, "layout");
    updateTag("site");
    return { ok: true, message: `Đã xoá ${ids.length} mục` };
  } catch (e) {
    return fail(e);
  }
}

export async function toggleAction(key: string, id: number, field: string) {
  try {
    const def = mod(key);
    const admin = await authorize(def.perm ?? def.key, "edit");
    const value = await toggleField(def, id, field, admin);
    revalidatePath(`/admin/${key}`, "layout");
    updateTag("site");
    return { ok: true, value } as SaveState & { value?: number };
  } catch (e) {
    return fail(e);
  }
}

export async function positionsAction(key: string, positions: Record<string, number>) {
  try {
    const def = mod(key);
    const admin = await authorize(def.perm ?? def.key, "edit");
    await savePositions(def, positions, admin);
    revalidatePath(`/admin/${key}`, "layout");
    updateTag("site");
    return { ok: true, message: "Đã lưu vị trí" };
  } catch (e) {
    return fail(e);
  }
}

export async function copyAction(key: string, id: number) {
  try {
    const def = mod(key);
    const admin = await authorize(def.perm ?? def.key, "add");
    const newId = await copyRecord(def, id, admin);
    revalidatePath(`/admin/${key}`, "layout");
    updateTag("site");
    return { ok: true, message: "Đã nhân bản", redirect: `/admin/${key}/${newId}` };
  } catch (e) {
    return fail(e);
  }
}
