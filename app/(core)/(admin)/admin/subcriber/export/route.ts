import { query } from "@/lib/db";
import { can } from "@/lib/perm";
import { requireAdmin } from "@/lib/session";

function unix(date: string | null, end = false) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return Math.floor(new Date(`${date}T${end ? "23:59:59" : "00:00:00"}`).getTime() / 1000);
}

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!can(admin, "subcriber", "list")) return new Response("Bạn không có quyền", { status: 403 });
  const url = new URL(request.url);
  const where: string[] = [];
  const args: unknown[] = [];
  const s = url.searchParams.get("s")?.trim();
  if (s) {
    where.push("email LIKE ?");
    args.push(`%${s}%`);
  }
  const from = unix(url.searchParams.get("created_from"));
  const to = unix(url.searchParams.get("created_to"), true);
  if (from) {
    where.push("created >= ?");
    args.push(from);
  }
  if (to) {
    where.push("created <= ?");
    args.push(to);
  }
  const rows = await query<{ id: number; email: string | null; created: number | null }>(
    `SELECT id, email, created FROM subcribers ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY id DESC`,
    args,
  );
  const cell = (v: unknown) => {
    const t = String(v ?? "");
    const safe = /^[=+\-@\t\r]/.test(t) ? `'${t}` : t;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const fmt = (n: number | null) => (n ? new Date(n * 1000).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "");
  const csv = ["STT,Email,Ngày đăng ký", ...rows.map((r, i) => [i + 1, cell(r.email), cell(fmt(r.created))].join(","))].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="dang-ky-nhan-tin-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
