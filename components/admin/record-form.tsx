"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ExternalLink, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { useLoadingRouter } from "@/hooks/use-loading-router";
import { saveAction, type SaveState } from "@/lib/actions/crud";
import type { ClientField, ClientModule } from "@/lib/modules/types";
import { cn } from "@/lib/utils";
import { FieldInput } from "./fields";
import { customFields } from "./custom";
import { SetBreadcrumb } from "@/components/set-breadcrumb";

const MAIN_TAB = "Thông tin chung";

export function RecordForm({
  module,
  id,
  values,
  preview,
  title,
  children,
}: {
  module: ClientModule;
  id: number | null;
  values: Record<string, unknown>;
  preview?: string;
  title?: string;
  children?: React.ReactNode;
}) {
  const router = useLoadingRouter();
  const [state, action, pending] = useActionState<SaveState, FormData>(
    saveAction.bind(null, module.key, id),
    {},
  );

  useEffect(() => {
    if (!state.at) return;
    if (state.error)
      toast.add({ type: "error", title: "Không lưu được", description: state.error });
    else if (state.ok) {
      toast.add({ type: "success", title: state.message ?? "Đã lưu" });
      if (state.redirect) router.push(state.redirect);
      else router.refresh();
    }
  }, [state, router]);

  const visible = module.fields.filter(
    (f) => !(f.only === "add" && id) && !(f.only === "edit" && !id),
  );
  const tabs = [MAIN_TAB, ...module.tabs.filter((t) => t !== MAIN_TAB)];
  for (const f of visible) if (f.tab && !tabs.includes(f.tab)) tabs.push(f.tab);
  const groups = tabs
    .map((t) => ({ tab: t, fields: visible.filter((f) => (f.tab ?? MAIN_TAB) === t) }))
    .filter((g) => g.fields.length);
  const heading =
    title ?? (id ? `Sửa ${module.title.toLowerCase()}` : `Thêm ${module.title.toLowerCase()}`);

  const renderFields = (fields: ClientField[]) => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {fields.map((f) => (
        <div key={f.name} className={cn("flex flex-col gap-1.5", !f.half && "md:col-span-2")}>
          <label className="text-sm font-medium">
            {f.label}
            {f.required && <span className="text-destructive"> *</span>}
          </label>
          <FieldInput field={f} value={values[f.name]} custom={customFields} />
          {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
        </div>
      ))}
    </div>
  );

  return (
    <form action={action} className="flex flex-col gap-4 p-2 md:p-4">
      {id && (
        <SetBreadcrumb
          segment={String(id)}
          label={String(values.title ?? values.name ?? values.code ?? `#${id}`)}
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-none"
          onClick={() => router.push(`/admin/${module.key}`)}
        >
          <ChevronLeft /> Danh sách
        </Button>
        <h1 className="text-lg font-semibold">{heading}</h1>
        {preview && (
          <Link
            href={preview}
            target="_blank"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="size-3.5" /> Xem trên website
          </Link>
        )}
        <Button type="submit" className="ml-auto" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />} Hoàn tất
        </Button>
      </div>
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        {groups.length > 1 ? (
          <Tabs defaultValue={groups[0].tab}>
            <TabsList className="mb-4 flex-wrap h-auto">
              {groups.map((g) => (
                <TabsTrigger key={g.tab} value={g.tab}>
                  {g.tab}
                </TabsTrigger>
              ))}
            </TabsList>
            {groups.map((g) => (
              <TabsContent key={g.tab} value={g.tab} keepMounted>
                {renderFields(g.fields)}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          renderFields(groups[0]?.fields ?? [])
        )}
        {children}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />} Hoàn tất
        </Button>
      </div>
    </form>
  );
}
