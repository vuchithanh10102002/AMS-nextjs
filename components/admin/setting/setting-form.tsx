"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Loader2, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { useLoadingRouter } from "@/hooks/use-loading-router";
import { ImageInput, SelectInput } from "@/components/admin/fields";
import { Editor } from "@/components/admin/editor";
import { saveSettings, sendTestMail, type SettingState } from "@/lib/actions/setting";
import type { SettingGroup, SettingItem } from "@/lib/settings-form";

const THEME_TAB = "Màu giao diện";

function ItemInput({ item }: { item: SettingItem }) {
  const name = `s:${item.name}`;
  switch (item.type) {
    case "textarea":
      return (
        <Textarea
          name={name}
          defaultValue={item.value}
          rows={item.name === "links" ? 8 : 4}
          maxLength={item.maxlength || undefined}
          className="font-mono text-xs"
        />
      );
    case "file":
      return <ImageInput name={name} defaultValue={item.value} root="files" />;
    case "editor":
      return <Editor name={name} defaultValue={item.value} height={200} />;
    case "select":
      return (
        <SelectInput
          name={name}
          options={item.options ?? []}
          defaultValue={item.value}
          allowEmpty={false}
        />
      );
    case "password":
      return <Input type="password" name={name} autoComplete="new-password" placeholder="••••••" />;
    default:
      return (
        <Input name={name} defaultValue={item.value} maxLength={item.maxlength || undefined} />
      );
  }
}

function ColorInput({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [v, setV] = useState(defaultValue);
  return (
    <div className="flex items-center gap-1">
      <input
        type="color"
        value={/^#[0-9a-f]{6}$/i.test(v) ? v : "#ffffff"}
        onChange={(e) => setV(e.target.value)}
        className="h-8 w-9 shrink-0 cursor-pointer rounded border bg-transparent p-0.5"
      />
      <Input
        name={name}
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="—"
        className="h-8 font-mono text-xs"
      />
    </div>
  );
}

export function SettingForm({
  groups,
  theme,
  themeGroups,
  themeKeys,
  hasTheme,
  hasPass,
  canEdit,
}: {
  groups: SettingGroup[];
  theme: Record<string, Record<string, string>>;
  themeGroups: string[];
  themeKeys: { key: string; label: string }[];
  hasTheme: boolean;
  hasPass: boolean;
  canEdit: boolean;
}) {
  const router = useLoadingRouter();
  const [state, action, pending] = useActionState<SettingState, FormData>(saveSettings, {});
  const [testing, startTest] = useTransition();

  useEffect(() => {
    if (!state.at) return;
    if (state.error)
      toast.add({ type: "error", title: "Không lưu được", description: state.error });
    else {
      toast.add({ type: "success", title: state.message ?? "Đã lưu" });
      router.refresh();
    }
  }, [state, router]);

  const test = () =>
    startTest(async () => {
      const r = await sendTestMail();
      toast.add(
        r.error
          ? { type: "error", title: "Gửi thử thất bại", description: r.error }
          : { type: "success", title: r.message },
      );
    });

  const tabs = [...groups.map((g) => g.title), ...(hasTheme ? [THEME_TAB] : [])];
  const submit = canEdit && (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Save />} Lưu cấu hình
    </Button>
  );

  return (
    <form action={action} className="flex flex-col gap-4 p-2 md:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-semibold">Cấu hình chung</h1>
        <div className="ml-auto">{submit}</div>
      </div>
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <Tabs defaultValue={tabs[0]}>
          <TabsList className="mb-4 h-auto flex-wrap">
            {tabs.map((t) => (
              <TabsTrigger key={t} value={t}>
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
          {groups.map((g) => (
            <TabsContent key={g.title} value={g.title} keepMounted>
              <div className="flex flex-col divide-y">
                {g.items.map((item) => (
                  <div
                    key={item.name}
                    className="grid grid-cols-1 gap-2 py-3 md:grid-cols-[220px_minmax(0,1fr)] md:gap-4"
                  >
                    <label className="pt-2 text-sm font-medium">
                      {item.label}
                      <span className="block text-xs font-normal text-muted-foreground">
                        {item.name}
                      </span>
                    </label>
                    <div className="flex flex-col gap-1">
                      <ItemInput item={item} />
                      {item.name === "smtp_pass" && hasPass && (
                        <p className="text-xs text-muted-foreground">
                          Đã có mật khẩu. Để trống nếu không đổi.
                        </p>
                      )}
                      {item.help && item.name !== "smtp_pass" && (
                        <p className="text-xs text-muted-foreground">{item.help}</p>
                      )}
                      {item.maxlength > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Tối đa {item.maxlength} ký tự
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {g.title === "Email SMTP" && canEdit && (
                <div className="flex flex-wrap items-center gap-2 pt-3">
                  <Button type="button" variant="outline" disabled={testing} onClick={test}>
                    {testing ? <Loader2 className="animate-spin" /> : <Send />} Gửi email thử
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Lưu cấu hình trước, email thử gửi tới &quot;Email nhận thông báo&quot;.
                  </span>
                </div>
              )}
            </TabsContent>
          ))}
          {hasTheme && (
            <TabsContent value={THEME_TAB} keepMounted>
              <input type="hidden" name="_theme" value="1" />
              <p className="mb-3 text-sm text-muted-foreground">
                Màu theo từng khối giao diện (#s1 – #s13). Để trống để dùng màu mặc định của theme.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="w-16 py-2 font-medium">Khối</th>
                      {themeKeys.map((k) => (
                        <th key={k.key} className="py-2 font-medium">
                          {k.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {themeGroups.map((g) => (
                      <tr key={g} className="border-t">
                        <td className="py-1.5 font-mono text-xs">#{g}</td>
                        {themeKeys.map((k) => (
                          <td key={k.key} className="py-1.5 pr-2">
                            <ColorInput
                              name={`t:${g}:${k.key}`}
                              defaultValue={theme[g]?.[k.key] ?? ""}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
      {submit && <div className="flex justify-end">{submit}</div>}
    </form>
  );
}
