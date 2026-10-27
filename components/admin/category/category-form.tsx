"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ExternalLink, Loader2, Save, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { useLoadingRouter } from "@/hooks/use-loading-router";
import { saveAction, type SaveState } from "@/lib/actions/crud";
import { titleExists } from "@/lib/actions/node";
import type { ClientField, ClientModule } from "@/lib/modules/types";
import { cn } from "@/lib/utils";
import { FieldInput, SelectInput } from "../fields";
import { SetBreadcrumb } from "@/components/set-breadcrumb";

const MAIN_TAB = "Thông tin chung";

function visibleFor(f: ClientField, ctype: string) {
  const show = f.props?.show as string[] | undefined;
  const hide = f.props?.hide as string[] | undefined;
  if (show && !show.includes(ctype)) return false;
  if (hide && hide.includes(ctype)) return false;
  return true;
}

export function CategoryForm({
  module,
  id,
  values,
  preview,
}: {
  module: ClientModule;
  id: number | null;
  values: Record<string, unknown>;
  preview?: string;
}) {
  const router = useLoadingRouter();
  const [state, action, pending] = useActionState<SaveState, FormData>(saveAction.bind(null, module.key, id), {});
  const [ctype, setCtype] = useState(String(values.ctype ?? ""));
  const [dup, setDup] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!state.at) return;
    if (state.error) toast.add({ type: "error", title: "Không lưu được", description: state.error });
    else if (state.ok) {
      toast.add({ type: "success", title: state.message ?? "Đã lưu" });
      if (state.redirect) router.push(state.redirect);
      else router.refresh();
    }
  }, [state.at]);

  const checkTitle = (title: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => setDup(await titleExists(title, id)), 500);
  };

  const fields = module.fields.filter((f) => !(f.only === "add" && id) && !(f.only === "edit" && !id));
  const tabs = [MAIN_TAB, ...module.tabs.filter((t) => t !== MAIN_TAB)];
  const groups = tabs.map((t) => ({ tab: t, fields: fields.filter((f) => (f.tab ?? MAIN_TAB) === t) })).filter((g) => g.fields.length);
  const allowed = module.can[id ? "edit" : "add"];

  const input = (f: ClientField) => {
    if (f.name === "ctype")
      return <SelectInput name="ctype" options={f.options ?? []} defaultValue={values.ctype} placeholder="--- Chọn kiểu mục lục ---" onChange={setCtype} />;
    if (f.name === "parent_id")
      return (
        <SelectInput
          name="parent_id"
          options={(f.options ?? []).filter((o) => !id || o.value !== String(values._mid))}
          defaultValue={values.parent_id}
          placeholder="--- Mục lục gốc ---"
        />
      );
    if (f.type === "select" && f.placeholder)
      return <SelectInput name={f.name} options={f.options ?? []} defaultValue={values[f.name]} placeholder={f.placeholder} />;
    if (f.name === "title")
      return (
        <div className="flex flex-col gap-1" onInput={(e) => checkTitle((e.target as HTMLInputElement).value)}>
          <FieldInput field={f} value={values.title} />
          {dup && (
            <p className="flex items-center gap-1 text-xs text-amber-600">
              <TriangleAlert className="size-3.5" /> Tiêu đề đã tồn tại
            </p>
          )}
        </div>
      );
    return <FieldInput field={f} value={values[f.name]} />;
  };

  const render = (list: ClientField[]) => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {list.map((f) => (
        <div key={f.name} className={cn("flex flex-col gap-1.5", !f.half && "md:col-span-2", !visibleFor(f, ctype) && "hidden")}>
          <label className="text-sm font-medium">
            {f.label}
            {f.required && <span className="text-destructive"> *</span>}
          </label>
          {input(f)}
          {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
        </div>
      ))}
    </div>
  );

  return (
    <form action={action} className="flex flex-col gap-4 p-2 md:p-4">
      {id && <SetBreadcrumb segment={String(id)} label={String(values.title ?? `#${id}`)} />}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" className="border-none" onClick={() => router.push(`/admin/${module.key}`)}>
          <ChevronLeft /> Danh sách
        </Button>
        <h1 className="text-lg font-semibold">{id ? "Sửa mục lục" : "Thêm mục lục"}</h1>
        {preview && (
          <Link href={preview} target="_blank" className="flex items-center gap-1 text-sm text-primary hover:underline">
            <ExternalLink className="size-3.5" /> Xem trên website
          </Link>
        )}
        <Button type="submit" className="ml-auto" disabled={pending || !allowed}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />} Hoàn tất
        </Button>
      </div>
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <Tabs defaultValue={groups[0]?.tab}>
          <TabsList className="mb-4 flex-wrap h-auto">
            {groups.map((g) => (
              <TabsTrigger key={g.tab} value={g.tab}>
                {g.tab}
              </TabsTrigger>
            ))}
          </TabsList>
          {groups.map((g) => (
            <TabsContent key={g.tab} value={g.tab} keepMounted>
              {render(g.fields)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending || !allowed}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />} Hoàn tất
        </Button>
      </div>
    </form>
  );
}
