import { RecordForm } from "@/components/admin/record-form";
import { loadRecord } from "@/lib/pages";

export default async function ModuleAddPage({ params }: PageProps<"/admin/[module]/add">) {
  const { module: key } = await params;
  const data = await loadRecord(key, null);
  return <RecordForm module={data.module} id={null} values={data.values} />;
}
