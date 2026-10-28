import "server-only";
import { offModules } from "@/site/admin";
import { requireAdmin, type Admin } from "./session";

export type Act = "list" | "add" | "edit" | "delete";

export function isSuper(admin: Admin) {
  return admin.id === 1;
}

export function roles(admin: Admin) {
  return (admin.role ?? "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
}

export function can(admin: Admin, perm: string, act: Act) {
  if (offModules.includes(perm)) return false;
  return isSuper(admin) || roles(admin).includes(`${perm}_${act}`);
}

export async function authorize(perm: string, act: Act) {
  const admin = await requireAdmin();
  if (!can(admin, perm, act)) throw new Error("Bạn không có quyền thực hiện thao tác này");
  return admin;
}
