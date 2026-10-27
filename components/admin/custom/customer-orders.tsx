"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { orderStatus } from "@/lib/order-status";
import { previewUrl } from "@/lib/media";

type Bill = { id: number; nguoi_nhan: string | null; dienthoai_nhan: string | null; cart_sum: number | null; paid_cart: number | null; status: number; created: number | null };
type Wish = { id: number; product_node_id: number; title: string | null; type: string | null; image: string | null; price: number | string | null; created: number | null };

const money = (v: unknown) => Number(v ?? 0).toLocaleString("vi-VN") + " đ";

export function CustomerOrders({ value }: { value: unknown }) {
  const bills = Array.isArray(value) ? (value as Bill[]) : [];
  if (!bills.length) return <p className="text-sm text-muted-foreground">Khách chưa có đơn hàng</p>;
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn</TableHead>
            <TableHead>Người nhận</TableHead>
            <TableHead>Thanh toán</TableHead>
            <TableHead>Ngày đặt</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                <Link href={`/admin/cart/${b.id}`} className="font-medium text-primary hover:underline">
                  #{b.id}
                </Link>
              </TableCell>
              <TableCell>
                {b.nguoi_nhan} {b.dienthoai_nhan && <span className="text-muted-foreground">– {b.dienthoai_nhan}</span>}
              </TableCell>
              <TableCell>{money(b.paid_cart)}</TableCell>
              <TableCell>{b.created ? new Date(b.created * 1000).toLocaleString("vi-VN") : "—"}</TableCell>
              <TableCell>
                <Badge variant={Number(b.status) >= 4 ? "default" : "secondary"}>{orderStatus.find((s) => s.value === String(b.status))?.label ?? b.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CustomerWishlist({ value }: { value: unknown }) {
  const items = Array.isArray(value) ? (value as Wish[]) : [];
  if (!items.length) return <p className="text-sm text-muted-foreground">Khách chưa thích sản phẩm nào</p>;
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((w) => (
        <div key={w.id} className="flex items-center gap-3 rounded-lg border p-2">
          {w.image ? <img src={previewUrl(w.image)} alt="" className="size-14 shrink-0 rounded border object-cover" /> : <div className="size-14 shrink-0 rounded border bg-muted" />}
          <div className="min-w-0 text-sm">
            {w.type === "product" ? (
              <Link href={`/admin/product/${w.product_node_id}`} className="font-medium hover:text-primary hover:underline">
                {w.title || `#${w.product_node_id}`}
              </Link>
            ) : (
              <span className="font-medium">{w.title || `#${w.product_node_id} (đã xoá)`}</span>
            )}
            {w.price != null && w.price !== "" && <div className="text-muted-foreground">{money(w.price)}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
