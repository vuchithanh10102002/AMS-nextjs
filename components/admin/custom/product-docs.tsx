"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageInput } from "@/components/admin/fields";

type Doc = { title?: string | null; title_en?: string | null; link?: string | null };
type Row = Doc & { key: number };

let seq = 0;

export function ProductDocs({ value }: { value?: unknown }) {
  const [rows, setRows] = useState<Row[]>(() =>
    (Array.isArray(value) ? (value as Doc[]) : []).map((d) => ({ ...d, key: seq++ })),
  );
  const move = (i: number, d: number) =>
    setRows((s) => {
      const j = i + d;
      if (j < 0 || j >= s.length) return s;
      const next = [...s];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="_documents" value="1" />
      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Chưa có tài liệu. Sản phẩm không có tài liệu thì website ẩn tab Tài liệu.
        </p>
      )}
      {rows.map((r, i) => (
        <div key={r.key} className="flex flex-col gap-2 rounded-md border p-2">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Tên tài liệu</span>
              <Input
                name="doc_title"
                defaultValue={r.title ?? ""}
                placeholder="VD: TDS – Bảng dữ liệu kỹ thuật"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Tên tài liệu (EN)</span>
              <Input
                name="doc_title_en"
                defaultValue={r.title_en ?? ""}
                placeholder="VD: Technical Data Sheet"
              />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                File (PDF, Word, Excel…) – để trống thì là nút yêu cầu tài liệu
              </span>
              <ImageInput name="doc_file" defaultValue={r.link ?? ""} root="files" />
            </div>
            <div className="flex shrink-0 gap-1 pb-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Lên"
                onClick={() => move(i, -1)}
              >
                <ArrowUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Xuống"
                onClick={() => move(i, 1)}
              >
                <ArrowDown />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Xoá"
                className="text-destructive"
                onClick={() => setRows((s) => s.filter((x) => x.key !== r.key))}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={() => setRows((s) => [...s, { key: seq++ }])}
      >
        <Plus /> Thêm tài liệu
      </Button>
    </div>
  );
}
