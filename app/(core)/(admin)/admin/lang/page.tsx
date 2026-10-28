import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { can } from "@/lib/perm";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Khoá giao diện" };

const PAGE_SIZE = 50;

function plain(v: string | null) {
  const s = String(v ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return s.length > 140 ? s.slice(0, 140) + "…" : s || "—";
}

export default async function LangListPage({ searchParams }: PageProps<"/admin/lang">) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) ?? "";
  if (one("key")) {
    const rest = new URLSearchParams();
    for (const [k, v] of Object.entries(sp))
      if (k !== "key" && typeof v === "string") rest.set(k, v);
    redirect(`/admin/lang/${encodeURIComponent(one("key"))}${rest.size ? `?${rest}` : ""}`);
  }
  const admin = await requireAdmin();
  if (!can(admin, "lang", "list")) redirect("/admin?denied=1");
  const s = one("s").trim();
  const page = Math.max(1, Number(one("page")) || 1);
  const where = s
    ? { OR: [{ key: { contains: s } }, { vi: { contains: s } }, { en: { contains: s } }] }
    : {};
  const [n, rows] = await Promise.all([
    db.langs.count({ where }),
    db.langs.findMany({
      where,
      select: { id: true, key: true, vi: true, en: true },
      orderBy: { id: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }) as Promise<{ id: number; key: string; vi: string | null; en: string | null }[]>,
  ]);
  const pages = Math.max(1, Math.ceil(n / PAGE_SIZE));
  const href = (p: number) =>
    `/admin/lang?${new URLSearchParams({ ...(s ? { s } : {}), page: String(p) })}`;

  return (
    <div className="flex flex-col gap-4 p-2 md:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-semibold">Khoá giao diện</h1>
        <span className="text-sm text-muted-foreground">{n.toLocaleString("vi-VN")} khoá</span>
        {can(admin, "lang", "add") && (
          <Button className="ml-auto" nativeButton={false} render={<Link href="/admin/lang/add" />}>
            <Plus /> Thêm khoá
          </Button>
        )}
      </div>
      <form method="get" className="flex max-w-xl gap-2">
        <Input name="s" defaultValue={s} placeholder="Tìm theo key hoặc nội dung..." />
        <Button type="submit" variant="outline">
          <Search /> Tìm
        </Button>
      </form>
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">STT</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Tiếng Việt</TableHead>
              <TableHead>Tiếng Anh</TableHead>
              <TableHead className="w-14" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell className="text-muted-foreground">
                  {(page - 1) * PAGE_SIZE + i + 1}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  <Link
                    href={`/admin/lang/${encodeURIComponent(r.key)}`}
                    className="text-primary hover:underline"
                  >
                    {r.key}
                  </Link>
                </TableCell>
                <TableCell className="max-w-md whitespace-normal">{plain(r.vi)}</TableCell>
                <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                  {plain(r.en)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    nativeButton={false}
                    render={<Link href={`/admin/lang/${encodeURIComponent(r.key)}`} />}
                  >
                    <Pencil />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Không có khoá nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          {page > 1 && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={href(page - 1)} />}
            >
              Trước
            </Button>
          )}
          <span>
            Trang {page}/{pages}
          </span>
          {page < pages && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={href(page + 1)} />}
            >
              Sau
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
