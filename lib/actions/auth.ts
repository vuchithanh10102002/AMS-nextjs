"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clearSession, setSession } from "@/lib/session";

export type LoginState = { error?: string };

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "Bạn cần nhập đầy đủ Username và Password" };

  const md5 = createHash("md5").update(password).digest("hex");
  const admin = await db.admins.findFirst({
    where: { username, password: md5 },
    orderBy: { id: "desc" },
    select: { id: true },
  });
  if (!admin) return { error: "Username hoặc Password không đúng" };

  await db.admins.updateMany({
    where: { id: admin.id },
    data: { last_logged: Math.floor(Date.now() / 1000) },
  });
  await setSession(admin.id);
  redirect("/admin");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
