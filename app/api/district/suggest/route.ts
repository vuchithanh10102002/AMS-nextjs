import { currentAdmin } from "@/lib/session";
import { first, query } from "@/lib/db";

export async function GET(request: Request) {
  if (!(await currentAdmin())) return Response.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const sp = new URL(request.url).searchParams;
  const search = sp.get("search")?.trim() ?? "";
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const cityId = Number(sp.get("city_id")) || 0;
  const where: string[] = [];
  const args: unknown[] = [];
  if (search) {
    where.push("title LIKE ?");
    args.push(`%${search}%`);
  }
  if (cityId) {
    where.push("city_id = ?");
    args.push(cityId);
  }
  const sql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = (await first<{ n: number }>(`SELECT COUNT(*) n FROM districts ${sql}`, args))?.n ?? 0;
  const items = await query<{ id: number; title: string }>(`SELECT id, title FROM districts ${sql} ORDER BY pos DESC, title LIMIT 15 OFFSET ?`, [...args, (page - 1) * 15]);
  return Response.json({ items, total_count: total });
}
