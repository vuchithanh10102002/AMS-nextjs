import { exec, first, query, type Row } from "@/lib/db";
import { slugify, slugTaken } from "@/lib/slug";
import type { ModuleDef } from "../types";

export async function ensureTagRows() {
  await exec(
    `INSERT INTO tags (node_id, node_tag_id)
     SELECT n.id, n.id FROM nodes n
     WHERE n.type = 'tag' AND NOT EXISTS (SELECT 1 FROM tags t WHERE t.node_id = n.id AND t.node_tag_id = n.id)`,
  );
}

async function findOrCreateTag(title: string) {
  const slug = slugify(title);
  if (!slug) return null;
  const hit = await first<{ id: number }>("SELECT id FROM nodes WHERE slug = ? AND type = 'tag' LIMIT 1", [slug]);
  if (hit) return hit.id;
  const now = Math.floor(Date.now() / 1000);
  const finalSlug = (await slugTaken(slug)) ? `${slug}-tag` : slug;
  const res = await exec("INSERT INTO nodes SET ?", [{ title: title.slice(0, 128), slug: finalSlug, type: "tag", pos: 1, status: 1, created: now, modified: now }]);
  await exec("INSERT INTO tags (node_id, node_tag_id) VALUES (?, ?)", [res.insertId, res.insertId]);
  return res.insertId;
}

export async function loadNewsTags(row: Row) {
  const tags = await query<{ title: string }>(
    `SELECT n.title FROM tags t INNER JOIN nodes n ON n.id = t.node_tag_id AND n.type = 'tag'
     WHERE t.node_id = ? AND t.node_id <> t.node_tag_id ORDER BY t.id`,
    [row.id],
  );
  return { ...row, tags: tags.map((t) => String(t.title ?? "").trim()) };
}

export async function saveNewsTags(newsNodeId: number, form: FormData) {
  if (!form.has("_tags")) return;
  const titles = [...new Set(form.getAll("tags").map((v) => String(v).trim()).filter(Boolean))];
  const ids: number[] = [];
  for (const t of titles) {
    const id = await findOrCreateTag(t);
    if (id && !ids.includes(id)) ids.push(id);
  }
  await exec("DELETE FROM tags WHERE node_id = ? AND node_id <> node_tag_id", [newsNodeId]);
  if (ids.length) await exec("INSERT INTO tags (node_id, node_tag_id) VALUES ?", [ids.map((id) => [newsNodeId, id])]);
}

export async function searchTags(q: string) {
  return query<{ title: string }>(
    "SELECT title FROM nodes WHERE type = 'tag' AND title LIKE ? ORDER BY pos DESC, id DESC LIMIT 20",
    [`%${q.trim()}%`],
  );
}

export const tag: ModuleDef = {
  key: "tag",
  title: "Tag",
  table: "tags",
  node: "tag",
  positions: true,
  statusToggle: true,
  list: {
    pageSize: 20,
    order: "n.pos DESC, n.id DESC",
    where: "m.node_tag_id = n.id",
    filters: [{ kind: "search", name: "s", label: "Tìm theo tên tag", columns: ["title", "slug"] }],
    columns: [
      { name: "title", label: "Tên", link: true },
      { name: "slug", label: "Slug" },
      { name: "_posts", label: "Số bài", kind: "number" },
      { name: "pos", label: "Vị trí", kind: "pos" },
      { name: "status", label: "Trạng thái", kind: "toggle" },
    ],
  },
  form: {
    tabs: ["Thông tin chung", "SEO"],
    fields: [
      { name: "title", label: "Tên", type: "text", required: true, maxLength: 128 },
      { name: "slug", label: "Slug", type: "slug", only: "edit", required: true },
      { name: "status", label: "Trạng thái", type: "select", required: true, default: 1, half: true, options: [{ value: "1", label: "Hiển thị" }, { value: "0", label: "Không hiển thị" }] },
      { name: "pos", label: "Vị trí", type: "number", default: 1, half: true },
      { name: "seo_title", label: "SEO Title", type: "text", tab: "SEO" },
      { name: "seo_keyword", label: "SEO Keywords", type: "text", tab: "SEO" },
      { name: "seo_description", label: "SEO Description", type: "textarea", rows: 3, maxLength: 300, tab: "SEO" },
    ],
  },
  hooks: {
    beforeSave: async ({ node }, ctx) => {
      if ("title" in node) node.title = String(node.title).trim();
      const slug = slugify(String(node.slug ?? node.title ?? ""));
      if (ctx.isNew) {
        if (!slug) throw new Error("Vui lòng nhập Tên");
        if (await slugTaken(slug)) throw new Error("Tag đã tồn tại (trùng đường dẫn với nội dung khác)");
        node.slug = slug;
      }
    },
    afterSave: async (id) => {
      await exec("UPDATE tags SET node_tag_id = node_id WHERE node_id = ? AND node_tag_id IS NULL", [id]);
    },
    afterDelete: async (ids) => {
      await exec("DELETE FROM tags WHERE node_tag_id IN (?)", [ids]);
    },
    decorate: async (rows) => {
      const ids = rows.map((r) => Number(r.id));
      if (!ids.length) return;
      const counts = await query<{ id: number; n: number }>(
        "SELECT node_tag_id id, COUNT(DISTINCT node_id) n FROM tags WHERE node_tag_id IN (?) AND node_id <> node_tag_id GROUP BY node_tag_id",
        [ids],
      );
      const map = new Map(counts.map((c) => [c.id, c.n]));
      for (const r of rows) r._posts = map.get(Number(r.id)) ?? 0;
    },
  },
};
