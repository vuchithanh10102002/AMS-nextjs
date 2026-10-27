"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ChevronLeft, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import { SetBreadcrumb } from "@/components/set-breadcrumb";
import { useLoadingRouter } from "@/hooks/use-loading-router";
import { deleteAction } from "@/lib/actions/crud";
import { setCartStatus } from "@/lib/actions/cart";
import { previewUrl } from "@/lib/media";
import { orderStatus } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export type OrderLine = {
  id: number;
  title: string;
  image: string | null;
  extra: string | null;
  price: number;
  quantity: number;
  nodeId: number | null;
  nodeType: string | null;
  combo: { title: string; products: { title: string; image: string | null; price: number }[] } | null;
};

type Bill = Record<string, any>;
type Customer = { id: number; fullname: string | null; username: string | null; phone: string | null; email: string | null; level: string | null };

const money = (v: unknown) => Number(v ?? 0).toLocaleString("vi-VN") + " đ";
const dateTime = (v: unknown) => (Number(v) ? new Date(Number(v) * 1000).toLocaleString("vi-VN") : "—");

function Thumb({ src }: { src: string | null }) {
  return src ? <img src={previewUrl(src)} alt="" className="size-16 shrink-0 rounded border object-cover bg-muted" /> : <div className="size-16 shrink-0 rounded border bg-muted" />;
}

export function CartDetail({ bill, lines, customer, canEdit, canDelete }: { bill: Bill; lines: OrderLine[]; customer: Customer | null; canEdit: boolean; canDelete: boolean }) {
  const router = useLoadingRouter();
  const [status, setStatus] = useState(Number(bill.status) || 0);
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const lineTotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  const changeStatus = (n: number) => {
    if (!canEdit || n === status) return;
    const old = status;
    setStatus(n);
    start(async () => {
      const r = await setCartStatus(Number(bill.id), n);
      if (r.error) {
        setStatus(old);
        toast.add({ type: "error", title: "Lỗi", description: r.error });
      } else {
        toast.add({ type: "success", title: r.message ?? "Đã lưu" });
        router.refresh();
      }
    });
  };

  const remove = () =>
    start(async () => {
      const r = await deleteAction("cart", [Number(bill.id)]);
      if (r.error) toast.add({ type: "error", title: "Lỗi", description: r.error });
      else {
        toast.add({ type: "success", title: "Đã xoá đơn hàng" });
        router.push("/admin/cart");
      }
      setConfirm(false);
    });

  const info: [string, React.ReactNode][] = [
    ["Họ tên", bill.nguoi_nhan],
    ["Điện thoại", bill.dienthoai_nhan],
    ["Email", bill.email_nhan],
    ["Địa chỉ", bill.diachi_nhan],
    ["Ghi chú", bill.content],
    ["Ngày đặt", dateTime(bill.created)],
    [
      "Tài khoản",
      customer ? (
        <Link href={`/admin/customer/${customer.id}`} className="text-primary hover:underline">
          {customer.fullname || customer.username} {customer.phone ? `– ${customer.phone}` : ""}
        </Link>
      ) : (
        "Khách vãng lai"
      ),
    ],
  ];
  if (Number(bill.points) > 0) info.push(["Điểm tích luỹ", bill.points]);

  return (
    <div className="flex flex-col gap-4 p-2 md:p-4 print:p-0">
      <SetBreadcrumb segment={String(bill.id)} label={`Đơn #${bill.id}`} />
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Button variant="outline" className="border-none" onClick={() => router.push("/admin/cart")}>
          <ChevronLeft /> Danh sách
        </Button>
        <h1 className="text-lg font-semibold">Đơn hàng #{bill.id}</h1>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer /> In đơn
          </Button>
          {canDelete && (
            <Button variant="destructive" onClick={() => setConfirm(true)}>
              <Trash2 /> Xoá
            </Button>
          )}
        </div>
      </div>
      <h1 className="hidden text-xl font-semibold print:block">Đơn hàng #{bill.id}</h1>

      <div className="rounded-lg border bg-card p-4 shadow-sm print:hidden">
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {orderStatus.map((s) => {
            const n = Number(s.value);
            const done = status >= n;
            return (
              <li key={s.value}>
                <button
                  type="button"
                  disabled={!canEdit || pending}
                  onClick={() => changeStatus(n)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors enabled:hover:border-primary",
                    done ? "border-primary bg-primary/10 font-medium text-primary" : "text-muted-foreground",
                  )}
                >
                  <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border text-xs", done && "border-primary bg-primary text-primary-foreground")}>
                    {done ? <Check className="size-3.5" /> : n + 1}
                  </span>
                  {s.label}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="hidden text-sm print:block">Trạng thái: {orderStatus[status]?.label ?? status}</p>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/10 hover:bg-primary/20">
                <TableHead className="w-10">STT</TableHead>
                <TableHead className="w-20">Hình ảnh</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-16 text-center text-sm text-muted-foreground">
                    Đơn không có dòng hàng
                  </TableCell>
                </TableRow>
              )}
              {lines.map((l, i) => (
                <TableRow key={l.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>
                    <Thumb src={l.image} />
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {l.nodeType === "product" ? (
                      <Link href={`/admin/product/${l.nodeId}`} className="font-medium hover:text-primary hover:underline">
                        {l.title}
                      </Link>
                    ) : (
                      <span className="font-medium">{l.combo?.title || l.title || "—"}</span>
                    )}
                    {l.extra && <div className="text-xs text-muted-foreground">{l.extra}</div>}
                    {l.combo && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {l.combo.products.map((p, j) => (
                          <div key={j} className="flex items-center gap-2">
                            {j > 0 && <span className="text-muted-foreground">+</span>}
                            <div className="flex items-center gap-2 rounded border p-1 pr-2 text-xs">
                              {p.image && <img src={previewUrl(p.image)} alt="" className="size-10 rounded object-cover" />}
                              <div>
                                <div className="font-medium">{p.title}</div>
                                <div className="text-muted-foreground">{money(p.price)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!l.nodeType && l.nodeId ? <div className="text-xs text-destructive">Sản phẩm đã bị xoá</div> : null}
                  </TableCell>
                  <TableCell className="text-right">{money(l.price)}</TableCell>
                  <TableCell className="text-right">{l.quantity}</TableCell>
                  <TableCell className="text-right">{money(l.price * l.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="text-right">
                  Giá gốc
                </TableCell>
                <TableCell className="text-right">{money(Number(bill.cart_sum) || lineTotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} className="text-right">
                  Số tiền giảm{bill.coupon_code ? ` (mã ${bill.coupon_code})` : ""}
                </TableCell>
                <TableCell className="text-right">{money(bill.coupon_discount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} className="text-right font-semibold">
                  Tổng thanh toán
                </TableCell>
                <TableCell className="text-right font-semibold text-primary">{money(bill.paid_cart)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Thông tin người đặt hàng</h2>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
          {info.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="whitespace-pre-wrap break-words">{v || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá đơn hàng #{bill.id}?</AlertDialogTitle>
            <AlertDialogDescription>Đơn và các dòng hàng của đơn sẽ bị xoá. Thao tác này không hoàn tác được.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={pending} onClick={remove}>
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
