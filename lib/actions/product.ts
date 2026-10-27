"use server";

import { revalidatePath } from "next/cache";
import { exec, first } from "@/lib/db";
import { authorize } from "@/lib/perm";
import { uniqueSlug } from "@/lib/slug";
import { deleteProductLinks } from "@/lib/modules/defs/product";

type Result = { ok?: boolean; error?: string; message?: string; redirect?: string };

async function run(act: "add" | "delete", fn: () => Promise<Result>): Promise<Result> {
  try {
    await authorize("product", act);
    const r = await fn();
    revalidatePath("/admin/product", "layout");
    return r;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Có lỗi xảy ra" };
  }
}

async function orphanNode(nodeId: number) {
  const n = await first<{ id: number }>(
    "SELECT n.id FROM nodes n LEFT JOIN products p ON p.node_id = n.id WHERE n.id = ? AND n.type = 'product' AND p.id IS NULL",
    [nodeId],
  );
  if (!n) throw new Error("Bản ghi không còn ở trạng thái mồ côi");
}

async function orphanProduct(productId: number) {
  const p = await first<{ id: number }>(
    "SELECT p.id FROM products p LEFT JOIN nodes n ON n.id = p.node_id WHERE p.id = ? AND (p.node_id IS NULL OR n.id IS NULL OR n.type <> 'product')",
    [productId],
  );
  if (!p) throw new Error("Bản ghi không còn ở trạng thái mồ côi");
}

export async function repairOrphanNode(nodeId: number) {
  return run("add", async () => {
    await orphanNode(nodeId);
    await exec("INSERT INTO products SET ?", [{ node_id: nodeId, status: 1 }]);
    return { ok: true, message: "Đã tạo dữ liệu sản phẩm", redirect: `/admin/product/${nodeId}` };
  });
}

export async function deleteOrphanNode(nodeId: number) {
  return run("delete", async () => {
    await orphanNode(nodeId);
    await exec("DELETE FROM category_linkeds WHERE node_id = ?", [nodeId]);
    await deleteProductLinks([nodeId]);
    await exec("DELETE FROM nodes WHERE id = ?", [nodeId]);
    return { ok: true, message: "Đã xoá node mồ côi" };
  });
}

export async function adoptOrphanProduct(productId: number) {
  return run("add", async () => {
    await orphanProduct(productId);
    const title = `Sản phẩm khôi phục #${productId}`;
    const now = Math.floor(Date.now() / 1000);
    const res = await exec("INSERT INTO nodes SET ?", [{ title, slug: await uniqueSlug(title), type: "product", pos: 1, status: 0, robots: 1, created: now, modified: now }]);
    await exec("UPDATE products SET node_id = ? WHERE id = ?", [res.insertId, productId]);
    return { ok: true, message: "Đã tạo node cho sản phẩm (đang ẩn)", redirect: `/admin/product/${res.insertId}` };
  });
}

export async function deleteOrphanProduct(productId: number) {
  return run("delete", async () => {
    await orphanProduct(productId);
    await exec("DELETE FROM products WHERE id = ?", [productId]);
    return { ok: true, message: "Đã xoá dòng sản phẩm mồ côi" };
  });
}
