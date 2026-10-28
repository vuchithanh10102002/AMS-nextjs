"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { ClientField } from "@/lib/modules/types";

function parse(value: unknown, count: number) {
  try {
    const v = JSON.parse(String(value ?? "")) as { value?: unknown[] };
    if (Array.isArray(v?.value))
      return Array.from({ length: count }, (_, i) => String(v.value?.[i] ?? ""));
  } catch {}
  return Array.from({ length: count }, () => "");
}

export function ProductRating({
  value,
  labels,
}: {
  field: ClientField;
  value?: unknown;
  labels: string[];
}) {
  const [vals, setVals] = useState(() => parse(value, labels.length));
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <input type="hidden" name="_extra" value="1" />
      {labels.map((l, i) => (
        <div key={l} className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{l}</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={100}
              name="extra_value"
              value={vals[i]}
              onChange={(e) => {
                const n =
                  e.target.value === ""
                    ? ""
                    : String(Math.min(100, Math.max(0, Number(e.target.value))));
                setVals((s) => s.map((x, j) => (j === i ? n : x)));
              }}
            />
            <div className="h-2 w-16 shrink-0 overflow-hidden rounded bg-muted">
              <div className="h-full bg-primary" style={{ width: `${Number(vals[i]) || 0}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
