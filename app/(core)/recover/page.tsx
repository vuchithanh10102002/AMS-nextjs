import type { Metadata } from "next";
import { RecoverForm } from "./recover-form";

export const metadata: Metadata = { title: "Quên mật khẩu" };

export default function RecoverPage() {
  return <RecoverForm />;
}
