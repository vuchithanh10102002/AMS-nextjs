import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CartDetail, type OrderLine } from "@/components/admin/cart/cart-detail";
import { db } from "@/lib/db";
import { can } from "@/lib/perm";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Chi tiết đơn hàng" };

export default async function CartDetailPage({ params }: PageProps<"/admin/cart/[id]">) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();
  const admin = await requireAdmin();
  if (!can(admin, "cart", "list")) redirect("/admin?denied=1");
  const bill = await db.order_bills.findUnique({ where: { id } });
  if (!bill) notFound();
  const rows = (
    await db.orders.findMany({ where: { bill_id: id }, orderBy: { id: "asc" }, include: { node: { select: { type: true, title: true, slug: true } } } })
  ).map(({ node, ...o }) => ({ ...o, node_type: node?.type ?? null, node_title: node?.title ?? null, node_slug: node?.slug ?? null }));
  const comboNodes = rows.filter((r) => r.node_type === "combo").map((r) => r.node_id).filter((n): n is number => n != null);
  const combos = comboNodes.length
    ? await db.combos.findMany({ where: { node_id: { in: comboNodes } }, select: { node_id: true, title: true, product_id: true } })
    : [];
  const productIds = [...new Set(combos.flatMap((c) => String(c.product_id ?? "").split(",").map(Number).filter(Boolean)))];
  const products = productIds.length
    ? (
        await db.products.findMany({
          where: { id: { in: productIds }, node: { isNot: null } },
          select: { id: true, image: true, price: true, node: { select: { title: true } } },
        })
      ).map(({ node, ...p }) => ({ ...p, title: node?.title ?? null }))
    : [];
  const lines: OrderLine[] = rows.map((r) => {
    const combo = combos.find((c) => c.node_id === r.node_id);
    return {
      id: r.id,
      title: r.title || r.node_title || "",
      image: r.image,
      extra: r.extra,
      price: Number(r.price) || 0,
      quantity: Number(r.quanity) || 0,
      nodeId: r.node_id,
      nodeType: r.node_type,
      combo: combo
        ? {
            title: combo.title || r.title || "",
            products: String(combo.product_id ?? "")
              .split(",")
              .map(Number)
              .filter(Boolean)
              .map((pid) => products.find((p) => p.id === pid))
              .filter(Boolean)
              .map((p) => ({ title: p!.title ?? "", image: p!.image, price: Number(p!.price) || 0 })),
          }
        : null,
    };
  });
  const customer = bill.customer_id
    ? await db.customers.findUnique({ where: { id: bill.customer_id }, select: { id: true, fullname: true, username: true, phone: true, email: true, level: true } })
    : null;
  return (
    <CartDetail
      bill={JSON.parse(JSON.stringify(bill))}
      lines={JSON.parse(JSON.stringify(lines))}
      customer={customer ? JSON.parse(JSON.stringify(customer)) : null}
      canEdit={can(admin, "cart", "edit")}
      canDelete={can(admin, "cart", "delete")}
    />
  );
}
