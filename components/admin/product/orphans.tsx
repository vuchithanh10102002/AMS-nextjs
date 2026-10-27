"use client";

import { useTransition } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useLoadingRouter } from "@/hooks/use-loading-router";
import { adoptOrphanProduct, deleteOrphanNode, deleteOrphanProduct, repairOrphanNode } from "@/lib/actions/product";

type OrphanNode = { id: number; title: string | null; slug: string | null; created: number | null };
type OrphanProduct = { id: number; node_id: number | null; price: number | null };

export function ProductOrphans({ nodes, products, canAdd, canDelete }: { nodes: OrphanNode[]; products: OrphanProduct[]; canAdd: boolean; canDelete: boolean }) {
  const router = useLoadingRouter();
  const [pending, start] = useTransition();
  if (!nodes.length && !products.length) return null;

  const run = (fn: () => Promise<{ ok?: boolean; error?: string; message?: string; redirect?: string }>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    start(async () => {
      const r = await fn();
      if (r.error) toast.add({ type: "error", title: "Lỗi", description: r.error });
      else {
        toast.add({ type: "success", title: r.message ?? "Đã xử lý" });
        if (r.redirect) router.push(r.redirect);
        else router.refresh();
      }
    });
  };

  return (
    <div className="mx-2 mt-2 flex flex-col gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm md:mx-4 md:mt-4">
      <p className="flex items-center gap-2 font-medium">
        <TriangleAlert className="size-4 text-amber-600" /> Dữ liệu sản phẩm mồ côi (không hiện trong danh sách)
      </p>
      {nodes.map((n) => (
        <div key={`n${n.id}`} className="flex flex-wrap items-center gap-2">
          <span className="min-w-0 flex-1">
            Node #{n.id} <b>{n.title || "(không tên)"}</b> <span className="text-muted-foreground">/{n.slug}.html — thiếu dòng products</span>
          </span>
          {canAdd && (
            <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => repairOrphanNode(n.id))}>
              Tạo dữ liệu SP
            </Button>
          )}
          {canDelete && (
            <Button size="sm" variant="ghost" className="text-destructive" disabled={pending} onClick={() => run(() => deleteOrphanNode(n.id), `Xoá node #${n.id}?`)}>
              Xoá
            </Button>
          )}
        </div>
      ))}
      {products.map((p) => (
        <div key={`p${p.id}`} className="flex flex-wrap items-center gap-2">
          <span className="min-w-0 flex-1">
            Products #{p.id} {p.price ? `(giá ${Number(p.price).toLocaleString("vi-VN")} đ)` : ""}{" "}
            <span className="text-muted-foreground">— {p.node_id ? `trỏ tới node #${p.node_id} không phải sản phẩm` : "không có node"}</span>
          </span>
          {canAdd && (
            <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => adoptOrphanProduct(p.id))}>
              Tạo node
            </Button>
          )}
          {canDelete && (
            <Button size="sm" variant="ghost" className="text-destructive" disabled={pending} onClick={() => run(() => deleteOrphanProduct(p.id), `Xoá dòng products #${p.id}?`)}>
              Xoá
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
