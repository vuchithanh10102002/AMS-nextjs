"use server";

import { revalidatePath } from "next/cache";
import { exec, first } from "@/lib/db";
import { authorize } from "@/lib/perm";
import { orderStatus } from "@/lib/order-status";

export async function setCartStatus(id: number, status: number) {
  try {
    await authorize("cart", "edit");
    if (!orderStatus.some((s) => Number(s.value) === status)) throw new Error("Trạng thái không hợp lệ");
    if (!(await first("SELECT id FROM order_bills WHERE id = ?", [id]))) throw new Error("Không tìm thấy đơn hàng");
    await exec("UPDATE order_bills SET status = ? WHERE id = ?", [status, id]);
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Đã đổi trạng thái" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Có lỗi xảy ra" };
  }
}
