"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { GripVertical, ImagePlus, Paperclip, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { MediaPicker } from "./media-picker";
import { normalizeMediaPath, previewUrl, isImage } from "@/lib/media";
import type { ClientField, Option } from "@/lib/modules/types";
import { slugify } from "@/lib/slug-client";

const Editor = dynamic(() => import("./editor").then((m) => m.Editor), {
  ssr: false,
  loading: () => <div className="h-40 animate-pulse rounded-lg border bg-muted" />,
});

export function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (v == null || v === "") return [];
  const s = String(v).trim();
  if (s.startsWith("[")) {
    try {
      return (JSON.parse(s) as unknown[]).map(String);
    } catch {}
  }
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function unixToDate(v: unknown, withTime = false) {
  if (v == null || v === "") return "";
  const n = Number(v);
  const d = Number.isFinite(n) && String(v).length >= 9 ? new Date(n * 1000) : new Date(String(v).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  const pad = (x: number) => String(x).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return withTime ? `${date}T${pad(d.getHours())}:${pad(d.getMinutes())}` : date;
}

export function MoneyInput({ name, defaultValue, placeholder }: { name: string; defaultValue?: unknown; placeholder?: string }) {
  const [v, setV] = useState(defaultValue == null || defaultValue === "" ? "" : String(defaultValue).replace(/\D/g, ""));
  return (
    <>
      <input type="hidden" name={name} value={v} />
      <Input
        inputMode="numeric"
        placeholder={placeholder}
        value={v ? Number(v).toLocaleString("vi-VN") : ""}
        onChange={(e) => setV(e.target.value.replace(/\D/g, ""))}
      />
    </>
  );
}

export function SelectInput({
  name,
  options,
  defaultValue,
  placeholder = "-- Chọn --",
  allowEmpty = true,
  onChange,
}: {
  name: string;
  options: Option[];
  defaultValue?: unknown;
  placeholder?: string;
  allowEmpty?: boolean;
  onChange?: (v: string) => void;
}) {
  const [v, setV] = useState(defaultValue == null ? "" : String(defaultValue));
  const items = allowEmpty ? [{ value: "", label: placeholder }, ...options] : options;
  return (
    <Select
      items={items}
      value={v}
      onValueChange={(x) => {
        setV(String(x ?? ""));
        onChange?.(String(x ?? ""));
      }}
    >
      <input type="hidden" name={name} value={v} />
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="max-h-80">
        {items.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function MultiSelect({ name, options, defaultValue, placeholder = "Chọn..." }: { name: string; options: Option[]; defaultValue?: unknown; placeholder?: string }) {
  const anchor = useComboboxAnchor();
  const [values, setValues] = useState<string[]>(toArray(defaultValue));
  const selected = useMemo(() => options.filter((o) => values.includes(o.value)), [options, values]);
  return (
    <>
      {values.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
      <Combobox
        multiple
        items={options}
        itemToStringLabel={(o: Option) => o.label.replace(/^(— )+/, "")}
        value={selected}
        onValueChange={(items: Option[]) => setValues(items.map((i) => i.value))}
      >
        <ComboboxChips ref={anchor} className="min-h-9">
          <ComboboxValue>
            {(items: Option[]) => (
              <>
                {items.map((o) => (
                  <ComboboxChip key={o.value}>{o.label.replace(/^(— )+/, "")}</ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder={items.length ? "" : placeholder} />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>Không có kết quả</ComboboxEmpty>
          <ComboboxList>
            {(o: Option) => (
              <ComboboxItem key={o.value} value={o}>
                {o.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </>
  );
}

export function ImageInput({ name, defaultValue, root = "images" }: { name: string; defaultValue?: unknown; root?: "images" | "files" }) {
  const [v, setV] = useState(defaultValue ? String(defaultValue) : "");
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input name={name} value={v} onChange={(e) => setV(e.target.value)} placeholder="Đường dẫn hoặc URL" />
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          {root === "images" ? <ImagePlus /> : <Paperclip />} Chọn
        </Button>
        {v && (
          <Button type="button" variant="ghost" size="icon" onClick={() => setV("")}>
            <X />
          </Button>
        )}
      </div>
      {v && isImage(v) && (
        <img src={previewUrl(v)} alt="" className="h-28 w-fit max-w-full rounded-md border object-contain bg-muted" />
      )}
      <MediaPicker open={open} root={root} onOpenChange={setOpen} onSelect={(p) => setV(normalizeMediaPath(p[0] ?? ""))} />
    </div>
  );
}

export function GalleryInput({ name, defaultValue }: { name: string; defaultValue?: unknown }) {
  const [items, setItems] = useState<string[]>(toArray(defaultValue));
  const [open, setOpen] = useState(false);
  const drag = useRef<number | null>(null);
  return (
    <div className="flex flex-col gap-2">
      {items.map((p, i) => (
        <input key={i} type="hidden" name={name} value={p} />
      ))}
      <div className="flex flex-wrap gap-2">
        {items.map((p, i) => (
          <div
            key={p + i}
            draggable
            onDragStart={() => (drag.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              const from = drag.current;
              if (from == null || from === i) return;
              setItems((s) => {
                const next = [...s];
                const [m] = next.splice(from, 1);
                next.splice(i, 0, m);
                return next;
              });
            }}
            className="group relative size-24 overflow-hidden rounded-md border bg-muted cursor-move"
          >
            <img src={previewUrl(p)} alt="" className="h-full w-full object-cover" />
            <GripVertical className="absolute left-1 top-1 size-4 text-white drop-shadow" />
            <button
              type="button"
              className="absolute right-1 top-1 rounded bg-background/90 p-0.5 text-destructive"
              onClick={() => setItems((s) => s.filter((_, j) => j !== i))}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs text-muted-foreground hover:bg-muted"
        >
          <ImagePlus className="size-5" /> Thêm ảnh
        </button>
      </div>
      <MediaPicker
        open={open}
        multiple
        onOpenChange={setOpen}
        onSelect={(paths) => setItems((s) => [...s, ...paths.map(normalizeMediaPath)])}
      />
    </div>
  );
}

export function SlugInput({ name, defaultValue, source = "title" }: { name: string; defaultValue?: unknown; source?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [v, setV] = useState(defaultValue ? String(defaultValue) : "");
  return (
    <div className="flex gap-2">
      <Input ref={ref} name={name} value={v} onChange={(e) => setV(e.target.value)} />
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const el = ref.current?.form?.elements.namedItem(source) as HTMLInputElement | null;
          if (el?.value) setV(slugify(el.value));
        }}
      >
        <RefreshCw /> Tạo từ tiêu đề
      </Button>
    </div>
  );
}

export function SwitchInput({ name, defaultValue }: { name: string; defaultValue?: unknown }) {
  const [v, setV] = useState(Number(defaultValue) === 1);
  return (
    <div className="flex h-9 items-center">
      <input type="hidden" name={name} value={v ? "1" : "0"} />
      <Switch checked={v} onCheckedChange={setV} />
    </div>
  );
}

export function FieldInput({ field, value, custom }: { field: ClientField; value: unknown; custom?: Record<string, React.ComponentType<any>> }) {
  const v = value ?? field.default ?? "";
  switch (field.type) {
    case "textarea":
      return <Textarea name={field.name} defaultValue={String(v)} rows={field.rows ?? 4} maxLength={field.maxLength} placeholder={field.placeholder} />;
    case "number":
      return <Input type="number" name={field.name} defaultValue={v === "" ? "" : String(v)} placeholder={field.placeholder} />;
    case "money":
      return <MoneyInput name={field.name} defaultValue={v} placeholder={field.placeholder} />;
    case "select":
      return <SelectInput name={field.name} options={field.options ?? []} defaultValue={v} allowEmpty={!field.required} />;
    case "multiselect":
    case "categories":
      return <MultiSelect name={field.name} options={field.options ?? []} defaultValue={v} />;
    case "switch":
      return <SwitchInput name={field.name} defaultValue={v} />;
    case "image":
      return <ImageInput name={field.name} defaultValue={v} />;
    case "file":
      return <ImageInput name={field.name} defaultValue={v} root="files" />;
    case "gallery":
      return <GalleryInput name={field.name} defaultValue={v} />;
    case "editor":
      return <Editor name={field.name} defaultValue={String(v)} height={field.height} />;
    case "date":
      return <Input type="date" name={field.name} defaultValue={field.storage === "unix" || /^\d+$/.test(String(v)) ? unixToDate(v) : String(v).slice(0, 10)} />;
    case "datetime":
      return <Input type="datetime-local" name={field.name} defaultValue={unixToDate(v, true)} />;
    case "color":
      return (
        <div className="flex items-center gap-2">
          <Input type="color" name={field.name} defaultValue={String(v) || "#000000"} className="h-9 w-16 p-1" />
        </div>
      );
    case "slug":
      return <SlugInput name={field.name} defaultValue={v} />;
    case "password":
      return <Input type="password" name={field.name} autoComplete="new-password" placeholder={field.placeholder ?? "Để trống nếu không đổi"} />;
    case "readonly":
      return <div className="min-h-9 rounded-lg border bg-muted/50 px-3 py-2 text-sm">{String(v) || "—"}</div>;
    case "custom": {
      const C = custom?.[field.component ?? ""];
      return C ? <C field={field} value={value} {...field.props} /> : <p className="text-sm text-destructive">Thiếu component {field.component}</p>;
    }
    default:
      return <Input name={field.name} defaultValue={String(v)} maxLength={field.maxLength} placeholder={field.placeholder} required={field.required} />;
  }
}
