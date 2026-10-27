"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ClientField } from "@/lib/modules/types";

const ACTS = [
  { key: "list", label: "Được xem" },
  { key: "add", label: "Thêm mới" },
  { key: "edit", label: "Sửa" },
  { key: "delete", label: "Xoá" },
];

export function AccountRoles({ field, value }: { field: ClientField; value: unknown }) {
  const [roles, setRoles] = useState(() => new Set(String(value ?? "").split(",").map((s) => s.trim()).filter(Boolean)));
  const groups = useMemo(() => {
    const out: { title: string; items: { key: string; title: string }[] }[] = [];
    for (const o of field.options ?? []) {
      const [group, title] = o.label.split("|");
      let g = out.find((x) => x.title === group);
      if (!g) out.push((g = { title: group, items: [] }));
      g.items.push({ key: o.value, title: title ?? o.value });
    }
    return out;
  }, [field.options]);
  const all = groups.flatMap((g) => g.items.flatMap((i) => ACTS.map((a) => `${i.key}_${a.key}`)));

  const set = (keys: string[], on: boolean) =>
    setRoles((prev) => {
      const next = new Set(prev);
      for (const k of keys) on ? next.add(k) : next.delete(k);
      return next;
    });

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="_roles" value="1" />
      {[...roles].filter((r) => all.includes(r)).map((r) => (
        <input key={r} type="hidden" name="role" value={r} />
      ))}
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => set(all, true)}>
          Chọn tất cả
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => set(all, false)}>
          Bỏ chọn tất cả
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Module</th>
              {ACTS.map((a) => (
                <th key={a.key} className="w-24 px-3 py-2 text-center font-medium">
                  <label className="flex cursor-pointer flex-col items-center gap-1">
                    {a.label}
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={all.filter((k) => k.endsWith(`_${a.key}`)).every((k) => roles.has(k))}
                      onChange={(e) => set(all.filter((k) => k.endsWith(`_${a.key}`)), e.target.checked)}
                    />
                  </label>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <GroupRows key={g.title} title={g.title} items={g.items} roles={roles} set={set} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupRows({
  title,
  items,
  roles,
  set,
}: {
  title: string;
  items: { key: string; title: string }[];
  roles: Set<string>;
  set: (keys: string[], on: boolean) => void;
}) {
  return (
    <>
      <tr className="border-t bg-muted/30">
        <td colSpan={5} className="px-3 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
          {title}
        </td>
      </tr>
      {items.map((i) => {
        const keys = ACTS.map((a) => `${i.key}_${a.key}`);
        return (
          <tr key={i.key} className="border-t">
            <td className="px-3 py-1.5">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={keys.every((k) => roles.has(k))}
                  onChange={(e) => set(keys, e.target.checked)}
                />
                {i.title}
                <span className="text-xs text-muted-foreground">({i.key})</span>
              </label>
            </td>
            {keys.map((k) => (
              <td key={k} className="px-3 py-1.5 text-center">
                <input type="checkbox" className="size-4 accent-primary" checked={roles.has(k)} onChange={(e) => set([k], e.target.checked)} />
              </td>
            ))}
          </tr>
        );
      })}
    </>
  );
}
