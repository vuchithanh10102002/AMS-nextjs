import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { db } from "./db";

export const SESSION_COOKIE = "nh_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

export type Admin = {
  id: number;
  parent_id: number | null;
  username: string;
  fullname: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  role: string | null;
  status: number;
};

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET phải dài ít nhất 32 ký tự");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeSession(adminId: number) {
  const payload = Buffer.from(
    JSON.stringify({ id: adminId, exp: Date.now() + MAX_AGE * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token?: string): { id: number } | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.id !== "number" || data.exp < Date.now()) return null;
    return { id: data.id };
  } catch {
    return null;
  }
}

export async function setSession(adminId: number) {
  (await cookies()).set(SESSION_COOKIE, encodeSession(adminId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function currentAdmin(): Promise<Admin | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await connection();
  const s = decodeSession(token);
  if (!s) return null;
  return db.admins.findUnique({
    where: { id: s.id },
    select: {
      id: true,
      parent_id: true,
      username: true,
      fullname: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      status: true,
    },
  }) as Promise<Admin | null>;
}

export async function requireAdmin(): Promise<Admin> {
  const admin = await currentAdmin();
  if (!admin) redirect("/login");
  return admin;
}
