import { db, type Row } from "@/lib/db";
import { slugify, slugTaken } from "@/lib/slug";
import type { ModuleDef } from "../types";

export async function ensureTagRows() {
  const missing = await db.nodes.findMany({
    where: { type: "tag", tags: { none: { node_tag_id: { equals: db.tags.fields.node_id } } } },
    select: { id: true },
  });
  if (missing.length)
    await db.tags.createMany({ data: missing.map((n) => ({ node_id: n.id, node_tag_id: n.id })) });
}

async function findOrCreateTag(title: string) {
  const slug = slugify(title);
  if (!slug) return null;
  const hit = await db.nodes.findFirst({ where: { slug, type: "tag" }, select: { id: true } });
  if (hit) return hit.id;
  const now = Math.floor(Date.now() / 1000);
  const finalSlug = (await slugTaken(slug)) ? `${slug}-tag` : slug;
  const { id } = await db.nodes.create({
    data: {
      title: title.slice(0, 128),
      slug: finalSlug,
      type: "tag",
      pos: 1,
      status: 1,
      created: now,
      modified: now,
    },
  });
  await db.tags.create({ data: { node_id: id, node_tag_id: id } });
  return id;
}

export async function loadNewsTags(row: Row) {
  const tags = await db.tags.findMany({
    where: {
      node_id: row.id,
      NOT: { node_tag_id: { equals: db.tags.fields.node_id } },
      tag: { is: { type: "tag" } },
    },
    select: { tag: { select: { title: true } } },
    orderBy: { id: "asc" },
  });
  return { ...row, tags: tags.map((t) => String(t.tag?.title ?? "").trim()) };
}

export async function saveNewsTags(newsNodeId: number, form: FormData) {
  if (!form.has("_tags")) return;
  const titles = [
    ...new Set(
      form
        .getAll("tags")
        .map((v) => String(v).trim())
        .filter(Boolean),
    ),
  ];
  const ids: number[] = [];
  for (const t of titles) {
    const id = await findOrCreateTag(t);
    if (id && !ids.includes(id)) ids.push(id);
  }
  await db.tags.deleteMany({
    where: { node_id: newsNodeId, NOT: { node_tag_id: { equals: db.tags.fields.node_id } } },
  });
  if (ids.length)
    await db.tags.createMany({ data: ids.map((id) => ({ node_id: newsNodeId, node_tag_id: id })) });
}

export async function searchTags(q: string) {
  return db.nodes.findMany({
    where: { type: "tag", title: { contains: q.trim() } },
    select: { title: true },
    orderBy: [{ pos: "desc" }, { id: "desc" }],
    take: 20,
  });
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
    order: [{ node: { pos: "desc" } }, { node: { id: "desc" } }],
    where: { node_tag_id: { equals: db.tags.fields.node_id } },
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
      {
        name: "status",
        label: "Trạng thái",
        type: "select",
        required: true,
        default: 1,
        half: true,
        options: [
          { value: "1", label: "Hiển thị" },
          { value: "0", label: "Không hiển thị" },
        ],
      },
      { name: "pos", label: "Vị trí", type: "number", default: 1, half: true },
      { name: "seo_title", label: "SEO Title", type: "text", tab: "SEO" },
      { name: "seo_keyword", label: "SEO Keywords", type: "text", tab: "SEO" },
      {
        name: "seo_description",
        label: "SEO Description",
        type: "textarea",
        rows: 3,
        maxLength: 300,
        tab: "SEO",
      },
    ],
  },
  hooks: {
    beforeSave: async ({ node }, ctx) => {
      if ("title" in node) node.title = String(node.title).trim();
      const slug = slugify(String(node.slug ?? node.title ?? ""));
      if (ctx.isNew) {
        if (!slug) throw new Error("Vui lòng nhập Tên");
        if (await slugTaken(slug))
          throw new Error("Tag đã tồn tại (trùng đường dẫn với nội dung khác)");
        node.slug = slug;
      }
    },
    afterSave: async (id) => {
      await db.tags.updateMany({
        where: { node_id: id, node_tag_id: null },
        data: { node_tag_id: id },
      });
    },
    afterDelete: async (ids) => {
      await db.tags.deleteMany({ where: { node_tag_id: { in: ids } } });
    },
    decorate: async (rows) => {
      const ids = rows.map((r) => Number(r.id));
      if (!ids.length) return;
      const links = await db.tags.findMany({
        where: {
          node_tag_id: { in: ids },
          NOT: { node_tag_id: { equals: db.tags.fields.node_id } },
        },
        select: { node_tag_id: true, node_id: true },
        distinct: ["node_tag_id", "node_id"],
      });
      const map = new Map<number, number>();
      for (const l of links)
        if (l.node_id != null)
          map.set(Number(l.node_tag_id), (map.get(Number(l.node_tag_id)) ?? 0) + 1);
      for (const r of rows) r._posts = map.get(Number(r.id)) ?? 0;
    },
  },
};
