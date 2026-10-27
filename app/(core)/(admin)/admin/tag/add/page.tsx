import type { Metadata } from "next";
import { RecordForm } from "@/components/admin/record-form";
import { loadRecord } from "@/lib/pages";

export const metadata: Metadata = { title: "Thêm tag" };

export default async function TagAddPage() {
  const data = await loadRecord("tag", null);
  return <RecordForm module={data.module} id={null} values={data.values} />;
}
