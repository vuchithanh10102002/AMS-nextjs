"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { ClientField, Option } from "@/lib/modules/types";
import { toArray } from "@/components/admin/fields";

export function ProductFilters({ field, value }: { field: ClientField; value?: unknown }) {
  const [checked, setChecked] = useState<string[]>(toArray(value));
  const groups: { id: string; title: string; items: Option[] }[] = [];
  for (const o of field.options ?? []) {
    if (o.value.startsWith("g:")) groups.push({ id: o.value, title: o.label, items: [] });
    else groups[groups.length - 1]?.items.push(o);
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="_filters" value="1" />
      {checked.map((v) => (
        <input key={v} type="hidden" name="filter_item" value={v} />
      ))}
      {groups.length === 0 && <p className="text-sm text-muted-foreground">Chưa có bộ lọc nào. Tạo ở mục Bộ lọc nâng cao.</p>}
      {groups.map((g) => (
        <div key={g.id} className="flex flex-col gap-2">
          <p className="text-sm font-medium">{g.title}</p>
          {g.items.length === 0 && <p className="text-xs text-muted-foreground">Nhóm chưa có tuỳ chọn</p>}
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {g.items.map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={checked.includes(o.value)}
                  onCheckedChange={(c) => setChecked((s) => (c ? [...s, o.value] : s.filter((x) => x !== o.value)))}
                />
                {o.label}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
