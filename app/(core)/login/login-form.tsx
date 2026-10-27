"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import GridLayout from "@/components/grid-layout";
import meeting from "@/assets/image/meeting.jpg";
import { login, type LoginState } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <GridLayout>
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="w-full max-w-sm md:max-w-4xl">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form action={action} className="p-6 md:p-8">
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Đăng nhập quản trị</h1>
                    <p className="text-balance text-muted-foreground">Nhập tài khoản admin của website</p>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <InputGroup className="bg-white">
                      <InputGroupInput id="username" name="username" autoComplete="username" required />
                    </InputGroup>
                  </Field>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Link href="/recover" className="ml-auto text-sm underline-offset-2 hover:underline">
                        Quên mật khẩu?
                      </Link>
                    </div>
                    <InputGroup className="bg-white">
                      <InputGroupInput
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                      />
                      <InputGroupAddon align="inline-end">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 w-6 size-4 border bg-transparent hover:bg-transparent"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                  </Field>
                  <Field>
                    <Button type="submit" disabled={pending}>
                      {pending ? "Đang đăng nhập..." : "Đăng nhập"}
                    </Button>
                  </Field>
                  <FieldDescription className="text-center">Webpx CMS</FieldDescription>
                </FieldGroup>
              </form>
              <div className="relative hidden bg-muted md:block">
                <Image src={meeting} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </GridLayout>
  );
}
