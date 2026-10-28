"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { ChevronRight, File, Folder, FolderPlus, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { isImage, previewUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type Item = { name: string; dir: boolean; path: string; size: number; mtime: number };

async function getDir(d: string): Promise<{ items: Item[]; dir?: string }> {
  const res = await fetch(`/api/media?dir=${encodeURIComponent(d)}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  root = "images",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (paths: string[]) => void;
  multiple?: boolean;
  root?: "images" | "files";
}) {
  const [dir, setDir] = useState<string>(root);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(open);
  const [selected, setSelected] = useState<string[]>([]);
  const [folder, setFolder] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const show = useCallback(
    (d: string, p: Promise<{ items: Item[]; dir?: string }>) =>
      p
        .then((data) => {
          setItems(data.items);
          setDir(data.dir || d);
        })
        .catch((e) =>
          toast.add({
            type: "error",
            title: "Lỗi",
            description: e instanceof Error ? e.message : "Không tải được thư mục",
          }),
        )
        .finally(() => setLoading(false)),
    [],
  );

  const load = (d: string) => {
    setLoading(true);
    return show(d, getDir(d));
  };

  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setSelected([]);
      setLoading(true);
    }
  }

  const reload = useEffectEvent(() => show(dir, getDir(dir)));

  useEffect(() => {
    if (open) reload();
  }, [open]);

  const post = async (body: FormData) => {
    body.set("dir", dir);
    const res = await fetch("/api/media", { method: "POST", body });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setLoading(true);
    try {
      const body = new FormData();
      for (const f of Array.from(files)) body.append("file", f);
      const data = await post(body);
      await load(dir);
      setSelected((s) => (multiple ? [...s, ...data.files] : data.files.slice(0, 1)));
    } catch (e) {
      toast.add({
        type: "error",
        title: "Upload lỗi",
        description: e instanceof Error ? e.message : "",
      });
      setLoading(false);
    }
  };

  const mkdir = async () => {
    if (!folder.trim()) return;
    try {
      const body = new FormData();
      body.set("action", "mkdir");
      body.set("name", folder);
      await post(body);
      setFolder("");
      load(dir);
    } catch (e) {
      toast.add({ type: "error", title: "Lỗi", description: e instanceof Error ? e.message : "" });
    }
  };

  const remove = async (item: Item) => {
    if (!confirm(`Xoá ${item.dir ? "thư mục" : "file"} "${item.name}"?`)) return;
    try {
      const body = new FormData();
      body.set("action", "delete");
      body.set("path", item.path);
      await post(body);
      setSelected((s) => s.filter((p) => p !== item.path));
      load(dir);
    } catch (e) {
      toast.add({ type: "error", title: "Lỗi", description: e instanceof Error ? e.message : "" });
    }
  };

  const toggle = (p: string) =>
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : multiple ? [...s, p] : [p]));

  const crumbs = dir.split("/").filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90dvh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Thư viện media</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-sm flex-1 min-w-0 overflow-x-auto">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1 shrink-0">
                {i > 0 && <ChevronRight className="size-3 text-muted-foreground" />}
                <button
                  type="button"
                  className="hover:underline"
                  onClick={() => load(crumbs.slice(0, i + 1).join("/"))}
                >
                  {c}
                </button>
              </span>
            ))}
          </div>
          <Input
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="Thư mục mới"
            className="w-40"
          />
          <Button type="button" variant="outline" onClick={mkdir}>
            <FolderPlus /> Tạo
          </Button>
          <Button type="button" onClick={() => fileRef.current?.click()}>
            <Upload /> Tải lên
          </Button>
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            onChange={(e) => upload(e.target.files).then(() => (e.target.value = ""))}
          />
        </div>
        <div
          className="relative flex-1 min-h-72 overflow-y-auto rounded-lg border bg-muted/30 p-2"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            upload(e.dataTransfer.files);
          }}
        >
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
              <Loader2 className="animate-spin" />
            </div>
          )}
          {!items.length && !loading && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Thư mục trống. Kéo thả file vào đây để tải lên.
            </p>
          )}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
            {items.map((item) => (
              <div
                key={item.path}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-md border bg-card text-xs cursor-pointer",
                  selected.includes(item.path) && "ring-2 ring-primary",
                )}
                onClick={() =>
                  item.dir
                    ? load(item.path.replace(/^app\/webroot\/uploads\//, ""))
                    : toggle(item.path)
                }
                onDoubleClick={() => {
                  if (!item.dir) {
                    onSelect([item.path]);
                    onOpenChange(false);
                  }
                }}
              >
                <div className="flex aspect-square items-center justify-center bg-muted">
                  {item.dir ? (
                    <Folder className="size-10 text-primary" />
                  ) : isImage(item.name) ? (
                    <img
                      src={previewUrl(item.path)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <File className="size-10 text-muted-foreground" />
                  )}
                </div>
                <span className="truncate px-1.5 py-1" title={item.name}>
                  {item.name}
                </span>
                <button
                  type="button"
                  className="absolute right-1 top-1 hidden rounded bg-background/90 p-1 text-destructive group-hover:block"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(item);
                  }}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <span className="mr-auto text-sm text-muted-foreground">Đã chọn {selected.length}</span>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button
            type="button"
            disabled={!selected.length}
            onClick={() => {
              onSelect(selected);
              onOpenChange(false);
            }}
          >
            Chọn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
