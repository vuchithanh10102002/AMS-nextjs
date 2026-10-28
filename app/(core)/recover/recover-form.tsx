"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import GridLayout from "@/components/grid-layout";
import { requestReset, resetPassword, type RecoverState } from "@/lib/actions/recover";

export function RecoverForm({ token, valid }: { token?: string; valid?: boolean }) {
  const [state, action, pending] = useActionState<RecoverState, FormData>(
    token ? resetPassword : requestReset,
    {},
  );

  return (
    <GridLayout>
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <Card className="w-full max-w-sm p-0">
          <CardContent className="p-6 md:p-8">
            <form action={action}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">
                    {token ? "Đặt mật khẩu mới" : "Quên mật khẩu"}
                  </h1>
                  <p className="text-balance text-muted-foreground">
                    {token
                      ? "Nhập mật khẩu mới cho tài khoản quản trị"
                      : "Nhập email của tài khoản quản trị"}
                  </p>
                </div>
                {token && !valid ? (
                  <p className="text-sm text-destructive text-center">
                    Đường dẫn không hợp lệ hoặc đã hết hạn.
                  </p>
                ) : state.done ? (
                  <p className="text-sm text-center">{state.done}</p>
                ) : token ? (
                  <>
                    <input type="hidden" name="token" value={token} />
                    <Field>
                      <FieldLabel htmlFor="password">Mật khẩu mới</FieldLabel>
                      <InputGroup className="bg-white">
                        <InputGroupInput
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          required
                          minLength={6}
                        />
                      </InputGroup>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="confirm">Nhập lại mật khẩu</FieldLabel>
                      <InputGroup className="bg-white">
                        <InputGroupInput
                          id="confirm"
                          name="confirm"
                          type="password"
                          autoComplete="new-password"
                          required
                          minLength={6}
                        />
                      </InputGroup>
                      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                    </Field>
                    <Button type="submit" disabled={pending}>
                      {pending ? "Đang lưu..." : "Lưu mật khẩu"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <InputGroup className="bg-white">
                        <InputGroupInput
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                        />
                      </InputGroup>
                      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                    </Field>
                    <Button type="submit" disabled={pending}>
                      {pending ? "Đang gửi..." : "Gửi đường dẫn đặt lại"}
                    </Button>
                  </>
                )}
                <FieldDescription className="text-center">
                  <Link href="/login">Quay lại đăng nhập</Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </GridLayout>
  );
}
