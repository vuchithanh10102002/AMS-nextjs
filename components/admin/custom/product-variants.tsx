"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoneyInput, SelectInput } from "@/components/admin/fields";
import type { ClientField } from "@/lib/modules/types";

type Variant = { size_id?: number | string | null; price?: number | null; price_vip?: number | null; price_gold?: number | null; price_member?: number | null };
type Row = Variant & { key: number };

let seq = 0;

const PRICES = [
  ["v_price", "price", "Giá bán"],
  ["v_vip", "price_vip", "Giá VIP"],
  ["v_gold", "price_gold", "Giá GOLD"],
  ["v_member", "price_member", "Giá MEMBER"],
] as const;

export function ProductVariants({ field, value }: { field: ClientField; value?: unknown }) {
  const [rows, setRows] = useState<Row[]>(() => (Array.isArray(value) ? (value as Variant[]) : []).map((v) => ({ ...v, key: seq++ })));
  const [sizes, setSizes] = useState<Record<number, string>>(() => Object.fromEntries(rows.map((r) => [r.key, r.size_id ? String(r.size_id) : ""])));
  const options = field.options ?? [];
  const dup = (key: number) => {
    const s = sizes[key];
    return !!s && rows.some((r) => r.key !== key && sizes[r.key] === s);
  };

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="_variants" value="1" />
      {rows.length === 0 && <p className="text-sm text-muted-foreground">Chưa có dòng giá nào.</p>}
      {rows.map((r) => (
        <div key={r.key} className="grid grid-cols-2 items-end gap-2 rounded-md border p-2 md:grid-cols-[1.2fr_repeat(4,1fr)_auto]">
          <div className="col-span-2 flex flex-col gap-1 md:col-span-1">
            <span className="text-xs text-muted-foreground">Dung tích</span>
            <SelectInput
              name="v_size"
              options={options}
              defaultValue={sizes[r.key]}
              placeholder="--- Chọn dung tích ---"
              onChange={(v) => setSizes((s) => ({ ...s, [r.key]: v }))}
            />
            {dup(r.key) && <span className="text-xs text-destructive">Trùng dung tích, chỉ dòng sau được lưu</span>}
          </div>
          {PRICES.map(([name, key, label]) => (
            <div key={name} className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{label}</span>
              <MoneyInput name={name} defaultValue={r[key]} />
            </div>
          ))}
          <Button type="button" variant="ghost" size="icon-sm" className="text-destructive" onClick={() => setRows((s) => s.filter((x) => x.key !== r.key))}>
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" className="w-fit" onClick={() => setRows((s) => [...s, { key: seq++ }])}>
        <Plus /> Thêm dòng giá
      </Button>
    </div>
  );
}
