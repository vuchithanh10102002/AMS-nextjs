"use server";

import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/lib/db";
import { authorize } from "@/lib/perm";
import { uniqueSlug } from "@/lib/slug";
import { deleteProductLinks } from "@/lib/modules/defs/product";

type Result = { ok?: boolean; error?: string; message?: string; redirect?: string };

async function run(act: "add" | "delete", fn: () => Promise<Result>): Promise<Result> {
  try {
    await authorize("product", act);
    const r = await fn();
    revalidatePath("/admin/product", "layout");
    updateTag("site");
    return r;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Có lỗi xảy ra" };
  }
}

async function orphanNode(nodeId: number) {
  const n = await db.nodes.findFirst({
    where: { id: nodeId, type: "product", products: { none: {} } },
    select: { id: true },
  });
  if (!n) throw new Error("Bản ghi không còn ở trạng thái mồ côi");
}

async function orphanProduct(productId: number) {
  const p = await db.products.findFirst({
    where: {
      id: productId,
      OR: [
        { node_id: null },
        { node: { is: null } },
        { node: { is: { NOT: { type: "product" } } } },
      ],
    },
    select: { id: true },
  });
  if (!p) throw new Error("Bản ghi không còn ở trạng thái mồ côi");
}

export async function repairOrphanNode(nodeId: number) {
  return run("add", async () => {
    await orphanNode(nodeId);
    await db.products.create({ data: { node_id: nodeId, status: 1 } });
    return { ok: true, message: "Đã tạo dữ liệu sản phẩm", redirect: `/admin/product/${nodeId}` };
  });
}

export async function deleteOrphanNode(nodeId: number) {
  return run("delete", async () => {
    await orphanNode(nodeId);
    await db.category_linkeds.deleteMany({ where: { node_id: nodeId } });
    await deleteProductLinks([nodeId]);
    await db.nodes.deleteMany({ where: { id: nodeId } });
    return { ok: true, message: "Đã xoá node mồ côi" };
  });
}

export async function adoptOrphanProduct(productId: number) {
  return run("add", async () => {
    await orphanProduct(productId);
    const title = `Sản phẩm khôi phục #${productId}`;
    const now = Math.floor(Date.now() / 1000);
    const node = await db.nodes.create({
      data: {
        title,
        slug: await uniqueSlug(title),
        type: "product",
        pos: 1,
        status: 0,
        robots: 1,
        created: now,
        modified: now,
      },
    });
    await db.products.updateMany({ where: { id: productId }, data: { node_id: node.id } });
    return {
      ok: true,
      message: "Đã tạo node cho sản phẩm (đang ẩn)",
      redirect: `/admin/product/${node.id}`,
    };
  });
}

export async function deleteOrphanProduct(productId: number) {
  return run("delete", async () => {
    await orphanProduct(productId);
    await db.products.deleteMany({ where: { id: productId } });
    return { ok: true, message: "Đã xoá dòng sản phẩm mồ côi" };
  });
}
