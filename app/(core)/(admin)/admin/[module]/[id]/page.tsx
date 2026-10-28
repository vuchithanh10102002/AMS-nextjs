import { RecordForm } from "@/components/admin/record-form";
import { loadRecord } from "@/lib/pages";

export default async function ModuleEditPage({ params }: PageProps<"/admin/[module]/[id]">) {
  const { module: key, id } = await params;
  const data = await loadRecord(key, id);
  return (
    <RecordForm module={data.module} id={data.id} values={data.values} preview={data.preview} />
  );
}
