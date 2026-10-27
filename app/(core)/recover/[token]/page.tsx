import type { Metadata } from "next";
import { checkResetToken } from "@/lib/actions/recover";
import { RecoverForm } from "../recover-form";

export const metadata: Metadata = { title: "Đặt mật khẩu mới" };

export default async function ResetPage({ params }: PageProps<"/recover/[token]">) {
  const { token } = await params;
  return <RecoverForm token={token} valid={await checkResetToken(token)} />;
}
