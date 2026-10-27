"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { suggestTags } from "@/lib/actions/tag";
import type { ClientField } from "@/lib/modules/types";

export function NewsTags({ field, value }: { field: ClientField; value: unknown }) {
  const [tags, setTags] = useState<string[]>(Array.isArray(value) ? value.map(String) : []);
  const [text, setText] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!text.trim()) return setHints([]);
    timer.current = setTimeout(async () => setHints(await suggestTags(text)), 300);
  }, [text]);

  const add = (raw: string) => {
    const parts = raw.split(",").map((t) => t.trim()).filter(Boolean);
    setTags((s) => [...s, ...parts.filter((p) => !s.some((x) => x.toLowerCase() === p.toLowerCase()))]);
    setText("");
    setHints([]);
  };

  return (
    <div className="relative">
      <input type="hidden" name="_tags" value="1" />
      {tags.map((t) => (
        <input key={t} type="hidden" name={field.name} value={t} />
      ))}
      <div className="flex min-h-9 flex-wrap items-center gap-1 rounded-lg border bg-transparent px-2 py-1 focus-within:ring-2 focus-within:ring-ring/50">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-sm">
            {t}
            <button type="button" onClick={() => setTags((s) => s.filter((x) => x !== t))}>
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          className="min-w-32 flex-1 bg-transparent text-sm outline-none"
          value={text}
          placeholder={tags.length ? "" : "Gõ tag rồi nhấn Enter hoặc dấu phẩy"}
          onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setText(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (text.trim()) add(text);
            } else if (e.key === "Backspace" && !text && tags.length) setTags((s) => s.slice(0, -1));
          }}
          onBlur={() => setTimeout(() => setHints([]), 150)}
        />
      </div>
      {hints.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-popover p-1 shadow-md">
          {hints
            .filter((h) => !tags.includes(h))
            .map((h) => (
              <button key={h} type="button" className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-muted" onMouseDown={() => add(h)}>
                {h}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
