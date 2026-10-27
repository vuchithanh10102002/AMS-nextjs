import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CartDetail, type OrderLine } from "@/components/admin/cart/cart-detail";
import { first, query } from "@/lib/db";
import { can } from "@/lib/perm";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Chi tiết đơn hàng" };

export default async function CartDetailPage({ params }: PageProps<"/admin/cart/[id]">) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();
  const admin = await requireAdmin();
  if (!can(admin, "cart", "list")) redirect("/admin?denied=1");
  const bill = await first("SELECT * FROM order_bills WHERE id = ?", [id]);
  if (!bill) notFound();
  const rows = await query(
    "SELECT o.*, n.type node_type, n.title node_title, n.slug node_slug FROM orders o LEFT JOIN nodes n ON n.id = o.node_id WHERE o.bill_id = ? ORDER BY o.id",
    [id],
  );
  const comboNodes = rows.filter((r) => r.node_type === "combo").map((r) => r.node_id);
  const combos = comboNodes.length ? await query("SELECT node_id, title, product_id FROM combos WHERE node_id IN (?)", [comboNodes]) : [];
  const productIds = [...new Set(combos.flatMap((c) => String(c.product_id ?? "").split(",").map(Number).filter(Boolean)))];
  const products = productIds.length
    ? await query("SELECT p.id, p.image, p.price, n.title FROM products p INNER JOIN nodes n ON n.id = p.node_id WHERE p.id IN (?)", [productIds])
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
            title: combo.title || r.title,
            products: String(combo.product_id ?? "")
              .split(",")
              .map(Number)
              .filter(Boolean)
              .map((pid) => products.find((p) => p.id === pid))
              .filter(Boolean)
              .map((p) => ({ title: p!.title, image: p!.image, price: Number(p!.price) || 0 })),
          }
        : null,
    };
  });
  const customer = bill.customer_id ? await first("SELECT id, fullname, username, phone, email, level FROM customers WHERE id = ?", [bill.customer_id]) : null;
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
