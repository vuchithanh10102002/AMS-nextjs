import { site } from "@/site/lib/ctx";

export async function Adm({ m, v, mode }: { m: string; v: string | number; mode?: string }) {
  const s = await site();
  if (!s.editor) return null;
  const href = s.adm(m, v, mode).match(/href="([^"]+)"/)?.[1];
  return (
    <a className="adm-glyphicon " href={href} target="_blank">
      <span style={{ color: "red" }} className="fa fa-cog"></span>
    </a>
  );
}
