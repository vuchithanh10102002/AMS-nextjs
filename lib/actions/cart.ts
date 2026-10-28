"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { authorize } from "@/lib/perm";
import { orderStatus } from "@/lib/order-status";

export async function setCartStatus(id: number, status: number) {
  try {
    await authorize("cart", "edit");
    if (!orderStatus.some((s) => Number(s.value) === status)) throw new Error("Trạng thái không hợp lệ");
    if (!(await db.order_bills.findUnique({ where: { id }, select: { id: true } }))) throw new Error("Không tìm thấy đơn hàng");
    await db.order_bills.updateMany({ where: { id }, data: { status } });
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Đã đổi trạng thái" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Có lỗi xảy ra" };
  }
}
