"use server";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";

export type RecoverState = { error?: string; done?: string };

const TTL = 60 * 60 * 1000;

function sign(payload: string) {
  return createHmac("sha256", process.env.SESSION_SECRET ?? "").update("recover." + payload).digest("base64url");
}

function makeToken(id: number, password: string) {
  const payload = Buffer.from(JSON.stringify({ id, exp: Date.now() + TTL, p: password.slice(0, 12) })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

async function readToken(token: string) {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.id !== "number" || data.exp < Date.now()) return null;
    const admin = await db.admins.findFirst({ where: { id: data.id, status: 1 }, select: { id: true, password: true } });
    if (!admin || (admin.password ?? "").slice(0, 12) !== data.p) return null;
    return admin;
  } catch {
    return null;
  }
}

export async function checkResetToken(token: string) {
  return (await readToken(token)) !== null;
}

export async function requestReset(_: RecoverState, formData: FormData): Promise<RecoverState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Bạn cần nhập email" };
  const done = { done: "Nếu email có trong hệ thống, đường dẫn đặt lại mật khẩu đã được gửi tới hộp thư (hiệu lực 1 giờ)." };
  const admin = await db.admins.findFirst({ where: { email, status: 1 }, orderBy: { id: "asc" }, select: { id: true, password: true, username: true } });
  if (!admin) return done;
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const link = `${origin}/recover/${makeToken(admin.id, admin.password ?? "")}`;
  try {
    await sendMail(
      email,
      `Đặt lại mật khẩu quản trị ${h.get("host")}`,
      `<p>Tài khoản: <b>${admin.username}</b></p><p>Bấm vào đường dẫn sau để đặt mật khẩu mới (hiệu lực 1 giờ, dùng một lần):</p><p><a href="${link}">${link}</a></p><p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`,
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gửi email thất bại" };
  }
  return done;
}

export async function resetPassword(_: RecoverState, formData: FormData): Promise<RecoverState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 6) return { error: "Mật khẩu tối thiểu 6 ký tự" };
  if (password !== confirm) return { error: "Mật khẩu nhập lại không khớp" };
  const admin = await readToken(token);
  if (!admin) return { error: "Đường dẫn không hợp lệ hoặc đã hết hạn" };
  await db.admins.updateMany({ where: { id: admin.id }, data: { password: createHash("md5").update(password).digest("hex") } });
  return { done: "Đã đặt mật khẩu mới. Bạn có thể đăng nhập." };
}
