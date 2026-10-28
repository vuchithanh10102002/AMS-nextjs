import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoryNamesByNode } from "@/lib/categories";
import { db } from "@/lib/db";
import { can } from "@/lib/perm";
import { requireAdmin } from "@/lib/session";
import { mediaUrl } from "@/lib/site";

export const metadata: Metadata = { title: "Tìm kiếm" };

const TYPES: Record<string, string> = { product: "Sản phẩm", news: "Bài viết", category: "Mục lục", tag: "Tag" };
const LIMIT = 20;

type Hit = { id: number; title: string; type: string; status: number; image: string | null };

export default async function SearchPage({ searchParams }: PageProps<"/admin/search">) {
  const sp = await searchParams;
  const s = String(sp.s ?? "").trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const admin = await requireAdmin();
  const types = Object.keys(TYPES).filter((t) => can(admin, t, "list"));

  let rows: Hit[] = [];
  let total = 0;
  if (s && types.length) {
    const where = { type: { in: types }, title: { contains: s } };
    const [hits, n] = await Promise.all([
      db.nodes.findMany({
        where,
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          products: { select: { image: true }, orderBy: { id: "asc" }, take: 1 },
          news: { select: { image: true }, orderBy: { id: "asc" }, take: 1 },
        },
        orderBy: [{ pos: "desc" }, { id: "desc" }],
        take: LIMIT,
        skip: (page - 1) * LIMIT,
      }),
      db.nodes.count({ where }),
    ]);
    rows = hits.map(({ products, news, ...h }) => ({
      ...(h as Omit<Hit, "image">),
      image: (h.type === "product" ? products[0]?.image : h.type === "news" ? news[0]?.image : null) ?? null,
    }));
    total = n;
  }
  const cats = await categoryNamesByNode(rows.filter((r) => r.type !== "category").map((r) => r.id));
  const pages = Math.ceil(total / LIMIT);
  const href = (p: number) => `/admin/search?s=${encodeURIComponent(s)}&page=${p}`;

  return (
    <div className="p-4 space-y-4">
      <form className="flex gap-2 max-w-xl">
        <Input name="s" defaultValue={s} placeholder="Tìm sản phẩm, bài viết, mục lục, tag..." autoFocus />
        <Button type="submit">Tìm</Button>
      </form>
      {s && <p className="text-sm text-muted-foreground">{total} kết quả cho “{s}”</p>}
      {rows.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Ảnh</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Mục lục</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-16">ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  {r.image && <img src={mediaUrl(r.image)} alt="" className="h-12 w-16 rounded object-cover" loading="lazy" />}
                </TableCell>
                <TableCell className="max-w-96 whitespace-normal font-medium">
                  <Link href={`/admin/${r.type}/${r.id}`} className="hover:text-primary hover:underline">
                    {r.title}
                  </Link>
                </TableCell>
                <TableCell>{TYPES[r.type]}</TableCell>
                <TableCell className="max-w-64 whitespace-normal">{(cats.get(r.id) ?? []).join(", ")}</TableCell>
                <TableCell>
                  <Badge variant={r.status === 1 ? "default" : "secondary"}>{r.status === 1 ? "Hiện" : "Ẩn"}</Badge>
                </TableCell>
                <TableCell>{r.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {pages > 1 && (
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: pages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 2)
            .map((p) => (
              <Button key={p} size="sm" variant={p === page ? "default" : "outline"} nativeButton={false} render={<Link href={href(p)} />}>
                {p}
              </Button>
            ))}
        </div>
      )}
    </div>
  );
}
