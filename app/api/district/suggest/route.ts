import { currentAdmin } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  if (!(await currentAdmin())) return Response.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const sp = new URL(request.url).searchParams;
  const search = sp.get("search")?.trim() ?? "";
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const cityId = Number(sp.get("city_id")) || 0;
  const where = { ...(search ? { title: { contains: search } } : {}), ...(cityId ? { city_id: cityId } : {}) };
  const [total, items] = await Promise.all([
    db.districts.count({ where }),
    db.districts.findMany({ where, select: { id: true, title: true }, orderBy: [{ pos: "desc" }, { title: "asc" }], take: 15, skip: (page - 1) * 15 }),
  ]);
  return Response.json({ items, total_count: total });
}
