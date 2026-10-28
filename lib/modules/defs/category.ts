import { db, type Row } from "@/lib/db";
import { categoryOptions, descendantIds, rebuildNestedSet } from "@/lib/categories";
import type { ListParams } from "@/lib/crud";
import type { ModuleDef, Option } from "../types";

export const categoryTypes: Option[] = [
  { value: "page", label: "Trang page" },
  { value: "link", label: "Chọn link" },
  { value: "news", label: "Tin tức" },
  { value: "product", label: "Sản phẩm" },
  { value: "document", label: "Tài liệu" },
];

export const newsTemplates: Option[] = [{ value: "our_people", label: "Our people" }];

export const pageTemplates: Option[] = [
  { value: "page_doc_list", label: "page_doc_list" },
  { value: "page_tuyendung", label: "page_tuyendung" },
  { value: "page_giaodichchungkhoan", label: "page_giaodichchungkhoan" },
  { value: "page_dichvutaichinh", label: "page_dichvutaichinh" },
  { value: "page_ungtruoctienban", label: "page_ungtruoctienban" },
  { value: "page_hotro", label: "page_hotro" },
  { value: "landing_sp", label: "landing_sp" },
];

export const categoryListFlags = ["menu", "featured", "footer_1", "footer_2", "home_menu"];

const yesNo = (yes: string, no: string): Option[] => [
  { value: "1", label: yes },
  { value: "0", label: no },
];

export const category: ModuleDef = {
  key: "category",
  title: "Mục lục",
  table: "categories",
  node: "category",
  positions: true,
  statusToggle: true,
  list: {
    filters: [
      { kind: "search", name: "s", label: "Tìm theo tên", columns: ["title"] },
      { kind: "category", name: "cid", label: "Mục lục" },
      { kind: "select", name: "t", label: "Dạng mục lục", column: "ctype", options: categoryTypes },
    ],
    toggles: categoryListFlags,
    columns: [
      { name: "_tree_title", label: "Tên mục lục", link: true },
      { name: "ctype", label: "Dạng m.lục", kind: "badge", options: categoryTypes },
      { name: "menu", label: "Menu", kind: "toggle" },
      { name: "featured", label: "Nổi bật", kind: "toggle" },
      { name: "footer_1", label: "C.trang c1", kind: "toggle" },
      { name: "footer_2", label: "C.trang c2", kind: "toggle" },
      { name: "home_menu", label: "Menu trang chủ", kind: "toggle" },
      { name: "pos", label: "V.trí", kind: "pos" },
      { name: "status", label: "Tr.thái", kind: "toggle" },
    ],
  },
  options: {
    parents: () => categoryOptions(),
  },
  form: {
    tabs: ["Thông tin chung", "Hiển thị", "SEO"],
    fields: [
      { name: "title", label: "Tên mục lục", type: "text", required: true, maxLength: 128 },
      { name: "slug", label: "Slug", type: "slug", only: "edit", required: true },
      { name: "parent_id", label: "Mục lục cha", type: "select", optionsKey: "parents", placeholder: "--- Mục lục gốc ---", half: true },
      { name: "ctype", label: "Kiểu mục lục", type: "select", required: true, options: categoryTypes, half: true },
      { name: "status", label: "Trạng thái", type: "select", required: true, default: 1, options: yesNo("Hoàn thiện", "Tạm lưu"), half: true },
      { name: "link", label: "Nhập link", type: "text", target: "main", placeholder: "https://...", props: { show: ["link", "document"] } },
      { name: "template_news", label: "Mẫu giao diện", type: "select", options: newsTemplates, placeholder: "Mặc định", props: { show: ["news"] } },
      { name: "template_page", label: "Mẫu giao diện", type: "select", options: pageTemplates, placeholder: "Mặc định", props: { show: ["page", "document"] } },
      { name: "page_title", label: "Tiêu đề Page", type: "text", props: { show: ["page", "document"] } },
      { name: "content", label: "Nội dung Page", type: "editor", height: 400, props: { show: ["page", "document"] } },
      { name: "description", label: "Mô tả", type: "editor", height: 300, props: { hide: ["page", "link"] } },
      { name: "image", label: "Ảnh", type: "image" },
      { name: "menu", label: "Hiển thị thanh menu", type: "switch", default: 1, tab: "Hiển thị", half: true },
      { name: "featured", label: "Nổi bật", type: "switch", default: 0, tab: "Hiển thị", half: true },
      { name: "home_menu", label: "Menu trang chủ", type: "switch", default: 0, tab: "Hiển thị", half: true },
      { name: "sidebar", label: "Sidebar", type: "switch", default: 0, tab: "Hiển thị", half: true },
      { name: "footer_1", label: "Chân trang cột 1", type: "switch", default: 0, tab: "Hiển thị", half: true },
      { name: "footer_2", label: "Chân trang cột 2", type: "switch", default: 0, tab: "Hiển thị", half: true },
      { name: "footer_3", label: "Chân trang cột 3", type: "switch", default: 0, tab: "Hiển thị", half: true },
      { name: "footer_4", label: "Chân trang cột 4", type: "switch", default: 0, tab: "Hiển thị", half: true },
      { name: "seo_title", label: "SEO Title", type: "text", tab: "SEO" },
      { name: "seo_keyword", label: "SEO Keywords", type: "textarea", rows: 2, tab: "SEO" },
      { name: "seo_description", label: "SEO Description", type: "textarea", rows: 4, maxLength: 300, tab: "SEO" },
      { name: "robots", label: "Robots", type: "select", default: 1, options: yesNo("Index", "Noindex"), tab: "SEO", half: true },
    ],
  },
  hooks: {
    load: async (row) => ({
      ...row,
      link: (await db.categories.findUnique({ where: { id: row._mid }, select: { link: true } }))?.link ?? "",
      parent_id: row.parent_id && row.parent_id !== row._mid ? row.parent_id : "",
      template_news: row.ctype === "news" ? row.template ?? "" : "",
      template_page: row.ctype !== "news" ? row.template ?? "" : "",
    }),
    beforeSave: async ({ node, main }, ctx) => {
      const ctype = String(main.ctype ?? ctx.before?.ctype ?? "news");
      if (!categoryTypes.some((t) => t.value === ctype)) throw new Error("Kiểu mục lục không hợp lệ");
      if ("title" in node) {
        node.title = String(node.title).trim();
        main.title = String(node.title).slice(0, 64);
        if (ctx.isNew) main.word_count = String(node.title).split(/\s+/).filter(Boolean).length;
      }
      main.template = ctype === "news" ? ctx.form.get("template_news") ?? "" : ctype === "product" ? ctx.before?.template ?? "" : ctx.form.get("template_page") ?? "";
      if ("parent_id" in main) {
        const parent = Number(main.parent_id) || null;
        if (parent && ctx.before) {
          const blocked = await descendantIds(Number(ctx.before._mid));
          if (blocked.includes(parent)) throw new Error("Không thể chọn chính mục này hoặc mục con của nó làm mục cha");
        }
        main.parent_id = parent;
      }
      if ("robots" in node) main.robots = node.robots;
      if ("title_en" in node) main.title_en = node.title_en;
      if (typeof main.seo_keyword === "string") main.seo_keyword = main.seo_keyword.replace(/\s+/g, " ").trim();
    },
    afterSave: async () => {
      await rebuildNestedSet();
    },
    afterDelete: async (_ids, rows) => {
      const roots = rows.map((r) => Number(r._mid)).filter(Boolean);
      const all = new Set<number>(roots);
      for (const id of roots) for (const d of await descendantIds(id)) all.add(d);
      const catIds = [...all];
      if (catIds.length) {
        const nodes = await db.categories.findMany({ where: { id: { in: catIds } }, select: { node_id: true } });
        const nodeIds = nodes.map((n) => n.node_id).filter((id): id is number => !!id);
        await db.category_linkeds.deleteMany({ where: { category_id: { in: catIds } } });
        await db.categories.deleteMany({ where: { id: { in: catIds } } });
        if (nodeIds.length) {
          await db.category_linkeds.deleteMany({ where: { node_id: { in: nodeIds } } });
          await db.nodes.deleteMany({ where: { id: { in: nodeIds }, type: "category" } });
        }
      }
      await rebuildNestedSet();
    },
  },
};

export async function categoryTreeRows(params: ListParams) {
  const cats = await db.categories.findMany({
    where: { node: { isNot: null } },
    select: {
      id: true,
      parent_id: true,
      ctype: true,
      link: true,
      lft: true,
      rght: true,
      menu: true,
      featured: true,
      footer_1: true,
      footer_2: true,
      home_menu: true,
      node: { select: { id: true, title: true, slug: true, pos: true, status: true, robots: true } },
      _count: { select: { category_linkeds: true } },
    },
    orderBy: [{ node: { pos: "desc" } }, { id: "desc" }],
  });
  const rows: Row[] = cats.map(({ id, node, _count, ...c }) => ({ ...node, _mid: id, ...c, _linked: _count.category_linkeds }));
  const ids = new Set(rows.map((r) => Number(r._mid)));
  const children = new Map<number | null, Row[]>();
  for (const r of rows) {
    const p = r.parent_id && r.parent_id !== r._mid && ids.has(Number(r.parent_id)) ? Number(r.parent_id) : null;
    if (!children.has(p)) children.set(p, []);
    children.get(p)!.push(r);
  }
  const ordered: Row[] = [];
  const seen = new Set<number>();
  const walk = (parent: number | null, depth: number) => {
    for (const r of children.get(parent) ?? []) {
      if (seen.has(r._mid)) continue;
      seen.add(r._mid);
      r._depth = depth;
      r._children = (children.get(r._mid) ?? []).length;
      ordered.push(r);
      walk(r._mid, depth + 1);
    }
  };
  walk(null, 0);

  const cid = Number(params.cid) || null;
  const scope = cid ? new Set(await descendantIds(cid)) : null;
  const s = params.s?.trim().toLowerCase();
  const t = params.t?.trim();
  const base = cid ? ordered.find((r) => r._mid === cid)?._depth ?? 0 : 0;
  return ordered
    .filter((r) => (!scope || scope.has(r._mid)) && (!t || r.ctype === t) && (!s || String(r.title ?? "").toLowerCase().includes(s)))
    .map((r) => {
      const depth = Math.max(0, r._depth - base);
      const extra = [r._children ? `${r._children} mục con` : "", r._linked ? `${r._linked} liên kết` : ""].filter(Boolean).join(", ");
      return { ...r, _tree_title: `${depth ? "│  ".repeat(depth - 1) + "└─ " : ""}${String(r.title ?? "").trim()}${extra ? ` (${extra})` : ""}` };
    });
}
