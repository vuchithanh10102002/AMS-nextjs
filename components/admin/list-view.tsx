"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Copy, ExternalLink, Filter, Pencil, Plus, Save, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import { useLoadingRouter } from "@/hooks/use-loading-router";
import { copyAction, deleteAction, positionsAction, toggleAction } from "@/lib/actions/crud";
import type { ClientModule, Column } from "@/lib/modules/types";
import { previewUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { SelectInput } from "./fields";

type Row = Record<string, any>;

export function formatCell(col: Column, v: any) {
  if (v == null || v === "") return "—";
  switch (col.kind) {
    case "money":
      return Number(v).toLocaleString("vi-VN") + " đ";
    case "number":
      return Number(v).toLocaleString("vi-VN");
    case "unix": {
      const n = Number(v);
      return n ? new Date(n * 1000).toLocaleDateString("vi-VN") : "—";
    }
    case "date":
      return new Date(String(v).replace(" ", "T")).toLocaleDateString("vi-VN");
    case "datetime": {
      const n = Number(v);
      const d = /^\d+$/.test(String(v)) && n > 1e9 ? new Date(n * 1000) : new Date(String(v).replace(" ", "T"));
      return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString("vi-VN");
    }
    case "badge":
      return col.options?.find((o) => o.value === String(v))?.label ?? String(v);
    case "categories":
      return Array.isArray(v) && v.length ? v.join(", ") : "—";
    case "html":
      return String(v).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) || "—";
    default:
      return String(v);
  }
}

export function ListView({
  module,
  rows: initialRows,
  total,
  page,
  pages,
  pageSize,
  siteUrl,
  extraActions,
}: {
  module: ClientModule;
  rows: Row[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
  siteUrl?: string;
  extraActions?: React.ReactNode;
}) {
  const router = useLoadingRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [rows, setRows] = useState(initialRows);
  const [selected, setSelected] = useState<number[]>([]);
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [confirm, setConfirm] = useState<number[] | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>(() => Object.fromEntries(params.entries()));
  const [pending, start] = useTransition();

  useEffect(() => {
    setRows(initialRows);
    setSelected([]);
    setPositions({});
  }, [initialRows]);

  const go = (next: Record<string, string>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) q.set(k, v);
    router.push(`${pathname}${q.size ? `?${q}` : ""}`);
  };

  const applyFilters = () => go({ ...filters, page: "" });
  const resetFilters = () => {
    setFilters({});
    go({});
  };

  const result = (r: { ok?: boolean; error?: string; message?: string }) => {
    if (r.error) toast.add({ type: "error", title: "Lỗi", description: r.error });
    else if (r.message) toast.add({ type: "success", title: r.message });
  };

  const toggle = (row: Row, field: string) => {
    const old = row[field];
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, [field]: Number(old) ? 0 : 1 } : r)));
    start(async () => {
      const r = await toggleAction(module.key, row.id, field);
      if (r.error) {
        setRows((rs) => rs.map((x) => (x.id === row.id ? { ...x, [field]: old } : x)));
        result(r);
      }
    });
  };

  const doDelete = (ids: number[]) =>
    start(async () => {
      const r = await deleteAction(module.key, ids);
      result(r);
      setConfirm(null);
      if (r.ok) router.refresh();
    });

  const savePos = () =>
    start(async () => {
      result(await positionsAction(module.key, positions));
      router.refresh();
    });

  const copy = (id: number) =>
    start(async () => {
      const r = await copyAction(module.key, id);
      result(r);
      if (r.ok && "redirect" in r && r.redirect) router.push(r.redirect);
    });

  const allChecked = rows.length > 0 && selected.length === rows.length;
  const canToggle = module.can.edit;
  const hasFilters = module.filters.length > 0;

  return (
    <div className="flex flex-col gap-4 p-2 md:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-semibold">Quản lý {module.title.toLowerCase()}</h1>
        <span className="text-sm text-muted-foreground">({total})</span>
        <div className="ml-auto flex flex-wrap gap-2">
          {extraActions}
          {module.positions && module.can.edit && Object.keys(positions).length > 0 && (
            <Button variant="outline" onClick={savePos} disabled={pending}>
              <Save /> Lưu vị trí
            </Button>
          )}
          {module.deletes && module.can.delete && selected.length > 0 && (
            <Button variant="destructive" onClick={() => setConfirm(selected)}>
              <Trash2 /> Xoá ({selected.length})
            </Button>
          )}
          {module.adds && module.can.add && (
            <Button onClick={() => router.push(`/admin/${module.key}/add`)}>
              <Plus /> Thêm mới
            </Button>
          )}
        </div>
      </div>

      {hasFilters && (
        <form
          className="flex flex-wrap items-end gap-2 rounded-lg border bg-card p-3 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }}
        >
          {module.filters.map((f) => {
            if (f.kind === "search")
              return (
                <InputGroup key={f.name} className="w-full sm:w-72 bg-background">
                  <InputGroupInput
                    placeholder={f.label}
                    value={filters[f.name] ?? ""}
                    onChange={(e) => setFilters((s) => ({ ...s, [f.name]: e.target.value }))}
                  />
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                </InputGroup>
              );
            if (f.kind === "daterange")
              return (
                <div key={f.name} className="flex w-full flex-wrap items-center gap-1 sm:w-auto">
                  <span className="text-sm text-muted-foreground">{f.label}</span>
                  <Input type="date" className="w-36 flex-1 sm:w-40 sm:flex-none" value={filters[`${f.name}_from`] ?? ""} onChange={(e) => setFilters((s) => ({ ...s, [`${f.name}_from`]: e.target.value }))} />
                  <span>–</span>
                  <Input type="date" className="w-36 flex-1 sm:w-40 sm:flex-none" value={filters[`${f.name}_to`] ?? ""} onChange={(e) => setFilters((s) => ({ ...s, [`${f.name}_to`]: e.target.value }))} />
                </div>
              );
            return (
              <div key={f.name + (filters[f.name] ?? "")} className="w-full sm:w-56">
                <SelectInput
                  name={`_f_${f.name}`}
                  options={f.options ?? []}
                  defaultValue={filters[f.name] ?? ""}
                  placeholder={`-- ${f.label} --`}
                  onChange={(v) => setFilters((s) => ({ ...s, [f.name]: v }))}
                />
              </div>
            );
          })}
          <Button type="submit" variant="secondary">
            <Filter /> Lọc
          </Button>
          {params.size > 0 && (
            <Button type="button" variant="ghost" onClick={resetFilters}>
              <X /> Xoá lọc
            </Button>
          )}
        </form>
      )}

      <div className="overflow-hidden rounded-lg border bg-card shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/10 hover:bg-primary/20">
                {module.deletes && module.can.delete && (
                  <TableHead className="w-8">
                    <Checkbox checked={allChecked} onCheckedChange={(c) => setSelected(c ? rows.map((r) => r.id) : [])} />
                  </TableHead>
                )}
                <TableHead className="w-10">STT</TableHead>
                {module.columns.map((c) => (
                  <TableHead key={c.name} style={c.width ? { width: c.width } : undefined}>
                    {c.label}
                  </TableHead>
                ))}
                <TableHead className="w-28 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={module.columns.length + 3} className="h-20 text-center text-sm text-muted-foreground">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row, i) => {
                const editHref = `/admin/${module.key}/${row.id}`;
                return (
                  <TableRow key={row.id} data-state={selected.includes(row.id) ? "selected" : undefined}>
                    {module.deletes && module.can.delete && (
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(row.id)}
                          onCheckedChange={(c) => setSelected((s) => (c ? [...s, row.id] : s.filter((x) => x !== row.id)))}
                        />
                      </TableCell>
                    )}
                    <TableCell className="text-muted-foreground">{(page - 1) * pageSize + i + 1}</TableCell>
                    {module.columns.map((c) => {
                      const v = row[c.name];
                      if (c.kind === "image")
                        return (
                          <TableCell key={c.name}>
                            {v ? <img src={previewUrl(String(v).split(",")[0])} alt="" className="h-12 w-16 rounded border object-cover bg-muted" /> : "—"}
                          </TableCell>
                        );
                      if (c.kind === "toggle")
                        return (
                          <TableCell key={c.name}>
                            <Switch checked={Number(v) === 1} disabled={!canToggle} onCheckedChange={() => toggle(row, c.name)} />
                          </TableCell>
                        );
                      if (c.kind === "pos")
                        return (
                          <TableCell key={c.name}>
                            <Input
                              type="number"
                              className="h-8 w-16"
                              disabled={!module.can.edit}
                              value={positions[row.id] ?? v ?? 1}
                              onChange={(e) => setPositions((p) => ({ ...p, [row.id]: Number(e.target.value) }))}
                            />
                          </TableCell>
                        );
                      return (
                        <TableCell key={c.name} className={cn("max-w-80 whitespace-normal", c.link && "font-medium")}>
                          {c.link && module.edits ? (
                            <Link href={editHref} className="hover:text-primary hover:underline">
                              {formatCell(c, v)}
                            </Link>
                          ) : (
                            formatCell(c, v)
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <div className="flex justify-end gap-0.5">
                        {module.previewLink && siteUrl && row.slug && (
                          <Button variant="ghost" size="icon-sm" title="Xem trên website" render={<a href={`${siteUrl}${row.slug}.html`} target="_blank" rel="noreferrer" />}>
                            <ExternalLink />
                          </Button>
                        )}
                        {module.copies && module.can.add && (
                          <Button variant="ghost" size="icon-sm" title="Nhân bản" onClick={() => copy(row.id)}>
                            <Copy />
                          </Button>
                        )}
                        {module.edits && (
                          <Button variant="ghost" size="icon-sm" title={module.can.edit ? "Sửa" : "Xem"} onClick={() => router.push(editHref)}>
                            <Pencil />
                          </Button>
                        )}
                        {module.deletes && module.can.delete && (
                          <Button variant="ghost" size="icon-sm" title="Xoá" className="text-destructive" onClick={() => setConfirm([row.id])}>
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {pages > 1 && <Pager page={page} pages={pages} onGo={(p) => go({ ...Object.fromEntries(params.entries()), page: String(p) })} />}

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn chắc chắn muốn xoá?</AlertDialogTitle>
            <AlertDialogDescription>Sẽ xoá {confirm?.length} mục. Thao tác này không hoàn tác được.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={pending} onClick={() => confirm && doDelete(confirm)}>
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function Pager({ page, pages, onGo }: { page: number; pages: number; onGo: (p: number) => void }) {
  const nums: (number | "…")[] = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 2) nums.push(p);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onGo(1)}>
        « Đầu
      </Button>
      {nums.map((n, i) =>
        n === "…" ? (
          <span key={i} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <Button key={i} variant={n === page ? "default" : "outline"} size="sm" onClick={() => onGo(n)}>
            {n}
          </Button>
        ),
      )}
      <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onGo(pages)}>
        Cuối »
      </Button>
    </div>
  );
}
