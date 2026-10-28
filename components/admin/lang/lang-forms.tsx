"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
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
import { useLoadingRouter } from "@/hooks/use-loading-router";
import { Editor } from "@/components/admin/editor";
import { ImageInput } from "@/components/admin/fields";
import { addLang, deleteLang, saveLang, type LangState } from "@/lib/actions/lang";
import { hasLink, isImageMode, LANG_MODES, LANGS, type LangMode } from "@/lib/lang-modes";
import { cn } from "@/lib/utils";

function Row({
  label,
  required,
  children,
  help,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  help?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {children}
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}

function useResult(state: LangState) {
  const router = useLoadingRouter();
  useEffect(() => {
    if (!state.at) return;
    if (state.error)
      toast.add({ type: "error", title: "Không lưu được", description: state.error });
    else {
      toast.add({ type: "success", title: state.message ?? "Đã lưu" });
      if (state.redirect) router.push(state.redirect);
      else router.refresh();
    }
  }, [state, router]);
  return router;
}

function Header({
  title,
  pending,
  children,
}: {
  title: string;
  pending: boolean;
  children?: React.ReactNode;
}) {
  const router = useLoadingRouter();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="border-none"
        onClick={() => router.push("/admin/lang")}
      >
        <ChevronLeft /> Danh sách
      </Button>
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="ml-auto flex gap-2">
        {children}
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />} Hoàn tất
        </Button>
      </div>
    </div>
  );
}

export function LangAddForm() {
  const [state, action, pending] = useActionState<LangState, FormData>(addLang, {});
  useResult(state);
  return (
    <form action={action} className="flex flex-col gap-4 p-2 md:p-4">
      <Header title="Thêm khoá" pending={pending} />
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
        <Row label="Key" required help="Chữ không dấu, số và _ - . (tối đa 64 ký tự)">
          <Input
            name="key"
            maxLength={64}
            pattern="[A-Za-z0-9_.\-]+"
            required
            className="font-mono"
          />
        </Row>
        <Row label="Tiếng Việt">
          <Textarea name="vi" rows={3} />
        </Row>
        <Row label="Tiếng Anh">
          <Textarea name="en" rows={3} />
        </Row>
      </div>
    </form>
  );
}

export type LangEditData = {
  key: string;
  lang: string;
  mode: LangMode;
  value: string;
  mobile: string | null;
  link: string;
  title: string;
  des: string;
  canDelete: boolean;
};

export function LangEditForm({ data }: { data: LangEditData }) {
  const { key, lang, mode } = data;
  const [state, action, pending] = useActionState<LangState, FormData>(
    saveLang.bind(null, key, lang, mode),
    {},
  );
  const router = useResult(state);
  const [confirm, setConfirm] = useState(false);
  const [deleting, startDelete] = useTransition();
  const href = (p: { lang: string }) =>
    `/admin/lang/${encodeURIComponent(key)}?${new URLSearchParams({ lang: p.lang, mode })}`;

  const remove = () =>
    startDelete(async () => {
      const r = await deleteLang(key);
      setConfirm(false);
      if (r.error) toast.add({ type: "error", title: "Không xoá được", description: r.error });
      else {
        toast.add({ type: "success", title: r.message ?? "Đã xoá" });
        router.push("/admin/lang");
      }
    });

  return (
    <form action={action} className="flex flex-col gap-4 p-2 md:p-4">
      <Header title="Sửa key" pending={pending}>
        {data.canDelete && (
          <Button
            type="button"
            variant="outline"
            className="text-destructive"
            onClick={() => setConfirm(true)}
          >
            <Trash2 /> Xoá
          </Button>
        )}
      </Header>
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-mono text-base">{key}</span>
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {LANG_MODES.find((m) => m.value === mode)?.label}
          </span>
          <span className="ml-auto text-muted-foreground">Ngôn ngữ:</span>
          {LANGS.map((l) => (
            <Link
              key={l.value}
              href={href({ lang: l.value })}
              className={cn(
                "rounded-md border px-2 py-1",
                l.value === lang
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
        {mode === "editor" ? (
          <Row label="Nội dung">
            <Editor name="value" defaultValue={data.value} height={320} />
          </Row>
        ) : isImageMode(mode) ? (
          <Row label="Ảnh" required>
            <ImageInput name="value" defaultValue={data.value} />
          </Row>
        ) : mode === "textarea" || mode === "textarea_link" ? (
          <Row label="Nội dung" required>
            <Textarea name="value" defaultValue={data.value} rows={5} required />
          </Row>
        ) : (
          <Row
            label={mode === "category" ? "ID mục lục" : "Nội dung"}
            required={mode === "text_link"}
            help={mode === "category" ? "Nhập CID mục lục (xem trong quản trị mục lục)" : undefined}
          >
            <Input name="value" defaultValue={data.value} required={mode === "text_link"} />
          </Row>
        )}
        {mode === "image" && data.mobile !== null && (
          <Row label="Ảnh mobile">
            <ImageInput name="mobile" defaultValue={data.mobile} />
          </Row>
        )}
        {hasLink(mode) && (
          <Row label="Link">
            <Input name="link" defaultValue={data.link} placeholder="https://..." />
          </Row>
        )}
        {mode === "image_link_text" && (
          <>
            <Row label="Tên">
              <Input name="title" defaultValue={data.title} />
            </Row>
            <Row label="Mô tả">
              <Textarea name="des" defaultValue={data.des} rows={3} />
            </Row>
          </>
        )}
      </div>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá khoá {key}?</AlertDialogTitle>
            <AlertDialogDescription>
              Mọi bản dịch của khoá sẽ mất. Thao tác này không hoàn tác được.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={deleting} onClick={remove}>
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
