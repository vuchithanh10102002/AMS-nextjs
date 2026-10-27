import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { first, query } from "@/lib/db";
import { orderStatus } from "@/lib/order-status";
import { can } from "@/lib/perm";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Tổng quan" };

const STATS = [
  { perm: "product", label: "Sản phẩm", url: "/admin/product", sql: "SELECT COUNT(*) n FROM nodes WHERE type = 'product'" },
  { perm: "news", label: "Bài viết", url: "/admin/news", sql: "SELECT COUNT(*) n FROM nodes WHERE type = 'news'" },
  { perm: "cart", label: "Đơn hàng mới", url: "/admin/cart", sql: "SELECT COUNT(*) n FROM order_bills WHERE status = 0" },
  { perm: "contact", label: "Liên hệ chưa đọc", url: "/admin/contact", sql: "SELECT COUNT(*) n FROM contacts WHERE status = 0" },
  { perm: "customer", label: "Khách hàng", url: "/admin/customer", sql: "SELECT COUNT(*) n FROM customers" },
  { perm: "subcriber", label: "Đăng ký nhận tin", url: "/admin/subcriber", sql: "SELECT COUNT(*) n FROM subcribers" },
];

type Order = { id: number; nguoi_nhan: string; dienthoai_nhan: string; cart_sum: number; status: number; created: number };
type Contact = { id: number; fullname: string; title: string; phone: string; status: number; created: number | string | null };

const date = (t: number | string | null) =>
  !t ? "" : isNaN(Number(t)) ? String(t) : new Date(Number(t) * 1000).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  const { denied } = await searchParams;
  const admin = await requireAdmin();
  const stats = STATS.filter((s) => can(admin, s.perm, "list"));
  const [counts, orders, contacts] = await Promise.all([
    Promise.all(stats.map((s) => first<{ n: number }>(s.sql).then((r) => r?.n ?? 0))),
    can(admin, "cart", "list")
      ? query<Order>("SELECT id, nguoi_nhan, dienthoai_nhan, cart_sum, status, created FROM order_bills ORDER BY id DESC LIMIT 8")
      : [],
    can(admin, "contact", "list")
      ? query<Contact>("SELECT id, fullname, title, phone, status, created FROM contacts ORDER BY id DESC LIMIT 8")
      : [],
  ]);

  return (
    <div className="p-4 space-y-4">
      {denied && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">Bạn không có quyền truy cập trang đó.</p>}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
        {stats.map((s, i) => (
          <Link key={s.url} href={s.url}>
            <Card className="hover:bg-muted/50">
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-semibold">{counts[i].toLocaleString("vi-VN")}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {can(admin, "cart", "list") && (
          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Người nhận</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!orders.length && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="h-20 text-center text-sm text-muted-foreground">
                        Chưa có đơn hàng
                      </TableCell>
                    </TableRow>
                  )}
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <Link href={`/admin/cart/${o.id}`} className="font-medium hover:text-primary hover:underline">
                          #{o.id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {o.nguoi_nhan}
                        <div className="text-xs text-muted-foreground">{o.dienthoai_nhan}</div>
                      </TableCell>
                      <TableCell className="text-right">{Number(o.cart_sum).toLocaleString("vi-VN")}đ</TableCell>
                      <TableCell>
                        <Badge variant={o.status === 0 ? "default" : "secondary"}>
                          {orderStatus.find((s) => s.value === String(o.status))?.label ?? o.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{date(o.created)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        {can(admin, "contact", "list") && (
          <Card>
            <CardHeader>
              <CardTitle>Liên hệ gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Ngày</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!contacts.length && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={3} className="h-20 text-center text-sm text-muted-foreground">
                        Chưa có liên hệ
                      </TableCell>
                    </TableRow>
                  )}
                  {contacts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link href={`/admin/contact/${c.id}`} className={c.status === 0 ? "font-semibold hover:underline" : "hover:underline"}>
                          {c.fullname || "(không tên)"}
                        </Link>
                        <div className="text-xs text-muted-foreground">{c.phone}</div>
                      </TableCell>
                      <TableCell className="max-w-64 whitespace-normal">{c.title}</TableCell>
                      <TableCell>{date(c.created)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
