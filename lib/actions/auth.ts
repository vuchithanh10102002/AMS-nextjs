"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { exec, first } from "@/lib/db";
import { clearSession, setSession } from "@/lib/session";

export type LoginState = { error?: string };

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "Bạn cần nhập đầy đủ Username và Password" };

  const md5 = createHash("md5").update(password).digest("hex");
  const admin = await first<{ id: number }>(
    "SELECT id FROM admins WHERE username = ? AND password = ? ORDER BY id DESC LIMIT 1",
    [username, md5],
  );
  if (!admin) return { error: "Username hoặc Password không đúng" };

  await exec("UPDATE admins SET last_logged = ? WHERE id = ?", [Math.floor(Date.now() / 1000), admin.id]);
  await setSession(admin.id);
  redirect("/admin");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
