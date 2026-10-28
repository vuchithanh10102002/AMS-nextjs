"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ClientField } from "@/lib/modules/types";

type Item = { key: number; id: string; title: string; content: string };

let seq = 0;

export function FilterItems({ value }: { field: ClientField; value?: unknown }) {
  const init = Array.isArray(value) ? (value as { id: number; title: string | null; content: string | null }[]) : [];
  const make = (it?: { id?: number; title?: string | null; content?: string | null }): Item => ({
    key: seq++,
    id: it?.id ? String(it.id) : "",
    title: it?.title ?? "",
    content: it?.content ?? "",
  });
  const [items, setItems] = useState<Item[]>(() => (init.length ? init.map(make) : [make()]));
  const set = (key: number, patch: Partial<Item>) => setItems((s) => s.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) =>
    setItems((s) => {
      const next = [...s];
      const j = i + d;
      if (j < 0 || j >= next.length) return s;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="flex flex-col gap-2">
      <div className="hidden grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground md:grid">
        <span>Tên lựa chọn lọc</span>
        <span>Giá trị lọc</span>
        <span className="w-28" />
      </div>
      {items.map((it, i) => (
        <div key={it.key} className="grid grid-cols-1 gap-2 rounded-md border p-2 md:grid-cols-[1fr_1fr_auto] md:border-0 md:p-0">
          <input type="hidden" name="item_id" value={it.id} />
          <Input name="item_title" placeholder="Tên lựa chọn lọc" value={it.title} onChange={(e) => set(it.key, { title: e.target.value })} />
          <Input name="item_content" placeholder="Giá trị lọc (vd: nam)" value={it.content} onChange={(e) => set(it.key, { content: e.target.value })} />
          <div className="flex w-28 gap-0.5">
            <Button type="button" variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => move(i, -1)}>
              <ArrowUp />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
              <ArrowDown />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" className="text-destructive" onClick={() => setItems((s) => s.filter((x) => x.key !== it.key))}>
              <Trash2 />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" className="w-fit" onClick={() => setItems((s) => [...s, make()])}>
        <Plus /> Thêm tuỳ chọn
      </Button>
      <p className="text-xs text-muted-foreground">Xoá một tuỳ chọn sẽ gỡ nó khỏi mọi sản phẩm đang gắn.</p>
    </div>
  );
}
