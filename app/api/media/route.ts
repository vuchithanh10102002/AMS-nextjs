import { mkdir, readdir, stat, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { currentAdmin } from "@/lib/session";
import { ALLOWED_EXT, resolveInUploads, safeFileName } from "@/lib/media-server";
import { UPLOAD_PREFIX } from "@/lib/media";

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export async function GET(request: Request) {
  if (!(await currentAdmin())) return json({ error: "Chưa đăng nhập" }, 401);
  const dir = new URL(request.url).searchParams.get("dir") ?? "images";
  try {
    const { abs, rel } = resolveInUploads(dir);
    await mkdir(abs, { recursive: true });
    const entries = await readdir(abs, { withFileTypes: true });
    const items = await Promise.all(
      entries
        .filter((e) => !e.name.startsWith(".") && e.name !== "_thumbs")
        .map(async (e) => {
          const s = await stat(path.join(abs, e.name));
          return {
            name: e.name,
            dir: e.isDirectory(),
            path: UPLOAD_PREFIX + (rel ? rel + "/" : "") + e.name,
            size: s.size,
            mtime: s.mtimeMs,
          };
        }),
    );
    items.sort((a, b) => (a.dir === b.dir ? b.mtime - a.mtime : a.dir ? -1 : 1));
    return json({ dir: rel, items });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Lỗi" }, 400);
  }
}

export async function POST(request: Request) {
  if (!(await currentAdmin())) return json({ error: "Chưa đăng nhập" }, 401);
  const form = await request.formData();
  const action = String(form.get("action") ?? "upload");
  try {
    const { abs, rel } = resolveInUploads(String(form.get("dir") ?? "images"));
    if (action === "mkdir") {
      const name = safeFileName(String(form.get("name") ?? "")).replace(/\.[^.]*$/, "");
      if (!name) return json({ error: "Tên thư mục không hợp lệ" }, 400);
      await mkdir(path.join(abs, name), { recursive: true });
      return json({ ok: true });
    }
    if (action === "delete") {
      const target = resolveInUploads(String(form.get("path") ?? ""));
      if (!target.rel || target.rel === "images" || target.rel === "files") return json({ error: "Không thể xoá thư mục gốc" }, 400);
      await rm(target.abs, { recursive: true, force: true });
      return json({ ok: true });
    }
    await mkdir(abs, { recursive: true });
    const saved: string[] = [];
    for (const file of form.getAll("file")) {
      if (!(file instanceof File)) continue;
      if (!ALLOWED_EXT.test(file.name)) return json({ error: `Định dạng không được phép: ${file.name}` }, 400);
      let name = safeFileName(file.name);
      const ext = path.extname(name);
      const base = name.slice(0, name.length - ext.length);
      for (let i = 2; await stat(path.join(abs, name)).then(() => true, () => false); i++) name = `${base}-${i}${ext}`;
      await writeFile(path.join(abs, name), Buffer.from(await file.arrayBuffer()));
      saved.push(UPLOAD_PREFIX + (rel ? rel + "/" : "") + name);
    }
    return json({ ok: true, files: saved });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Lỗi" }, 400);
  }
}
