import "server-only";
import { db } from "@/lib/db";
import { normalizeMediaPath } from "@/lib/media";
import type { Field, FilterDef, ModuleDef } from "@/lib/modules/types";

const TAB = "English";
const DOCS = "Tài liệu";

const seo: Field[] = [
  { name: "seo_title_en", label: "SEO Title (EN)", type: "text", tab: TAB },
  { name: "seo_keyword_en", label: "SEO Keywords (EN)", type: "text", tab: TAB },
  {
    name: "seo_description_en",
    label: "SEO Description (EN)",
    type: "textarea",
    rows: 4,
    tab: TAB,
  },
];

type Patch = {
  title?: string;
  hide?: string[];
  set?: Record<string, Partial<Field>>;
  add?: Field[];
  columns?: string[];
  replace?: Field[];
  filters?: Record<string, Partial<FilterDef>>;
};

function patch(def: ModuleDef, p: Patch): ModuleDef {
  const hide = new Set(p.hide ?? []);
  const cols = new Set(p.columns ?? []);
  const base =
    p.replace ??
    (def.form?.fields ?? [])
      .filter((f) => !hide.has(f.name))
      .map((f) => (p.set?.[f.name] ? { ...f, ...p.set[f.name] } : f));
  const fields = [...base, ...(p.add ?? [])];
  const tabs = def.form?.tabs ?? [];
  return {
    ...def,
    title: p.title ?? def.title,
    list: {
      ...def.list,
      columns: def.list.columns.filter((c) => !cols.has(c.name)),
      toggles: def.list.toggles?.filter((t) => !cols.has(t)),
      filters: def.list.filters?.map((x) => ({ ...x, ...p.filters?.[x.name] }) as FilterDef),
    },
    form: {
      tabs: fields.some((f) => f.tab === TAB) && !tabs.includes(TAB) ? [...tabs, TAB] : tabs,
      fields,
    },
  };
}

const patches: Record<string, (def: ModuleDef) => ModuleDef> = {
  product: (def) => {
    const next = patch(def, {
      hide: [
        "price_off",
        "price",
        "price_vip",
        "price_gold",
        "price_member",
        "gender",
        "sizes",
        "colors",
        "flashsale_id",
        "extra",
        "variants",
        "filter_items",
      ],
      set: { hang_id: { label: "Thương hiệu" }, content_2: { label: "Đặc tính kỹ thuật (tab)" } },
      filters: { s: { label: "Tìm theo tên" }, hang_id: { label: "Thương hiệu" } },
      columns: ["price", "footer_1", "footer_2", "footer_3", "footer_4", "top_search", "featured"],
      add: [
        { name: "title_en", label: "Tên sản phẩm (EN)", type: "text", target: "node", tab: TAB },
        {
          name: "description_en",
          label: "Mô tả sản phẩm (EN)",
          type: "editor",
          height: 300,
          tab: TAB,
        },
        { name: "content_en", label: "Nội dung (EN)", type: "editor", height: 500, tab: TAB },
        {
          name: "content_2_en",
          label: "Đặc tính kỹ thuật (EN)",
          type: "editor",
          height: 300,
          tab: TAB,
        },
        ...seo,
        {
          name: "documents",
          label: "Tài liệu sản phẩm",
          type: "custom",
          component: "product-docs",
          tab: DOCS,
          help: "Riêng sản phẩm này. Có file thì khách bấm để tải; không có file thì nút mở form yêu cầu tài liệu.",
        },
      ],
    });
    const h = def.hooks ?? {};
    return {
      ...next,
      form: {
        fields: next.form?.fields ?? [],
        tabs: [...(next.form?.tabs ?? []).filter((t) => t !== TAB), DOCS, TAB],
      },
      hooks: {
        ...h,
        load: async (row) => {
          const r = h.load ? await h.load(row) : row;
          r.documents = await db.documents.findMany({
            where: { node_id: r.id },
            select: { title: true, title_en: true, link: true },
            orderBy: [{ pos: "asc" }, { id: "asc" }],
          });
          return r;
        },
        afterSave: async (id, data, ctx) => {
          await h.afterSave?.(id, data, ctx);
          if (!ctx.form.has("_documents")) return;
          const all = (n: string) => ctx.form.getAll(n).map((v) => String(v).trim());
          const titles = all("doc_title");
          const titlesEn = all("doc_title_en");
          const rows = all("doc_file")
            .map((v, i) => {
              const link = normalizeMediaPath(v);
              const title = titles[i] || (link.split("/").pop() ?? "");
              return { node_id: id, title, title_en: titlesEn[i] ?? "", link, pos: i + 1 };
            })
            .filter((d) => d.title);
          await db.documents.deleteMany({ where: { node_id: id } });
          if (rows.length) await db.documents.createMany({ data: rows });
        },
        afterDelete: async (ids, rows) => {
          await h.afterDelete?.(ids, rows);
          if (ids.length) await db.documents.deleteMany({ where: { node_id: { in: ids } } });
        },
        afterCopy: async (newId, srcId) => {
          await h.afterCopy?.(newId, srcId);
          const docs = await db.documents.findMany({
            where: { node_id: srcId },
            select: { title: true, title_en: true, link: true, image: true, pos: true },
          });
          if (docs.length)
            await db.documents.createMany({ data: docs.map((d) => ({ ...d, node_id: newId })) });
        },
      },
    };
  },
  news: (def) =>
    patch(def, {
      add: [
        { name: "title_en", label: "Tiêu đề (EN)", type: "text", target: "node", tab: TAB },
        { name: "description_en", label: "Mô tả (EN)", type: "editor", height: 300, tab: TAB },
        { name: "content_en", label: "Nội dung (EN)", type: "editor", height: 500, tab: TAB },
        ...seo,
      ],
    }),
  category: (def) =>
    patch(def, {
      hide: ["template_news", "page_title", "sidebar"],
      set: {
        ctype: {
          options: def.form?.fields
            .find((f) => f.name === "ctype")
            ?.options?.filter((o) => o.value !== "document"),
        },
        template_page: {
          options: [
            { value: "gioi-thieu", label: "Giới thiệu" },
            { value: "thuong-hieu", label: "Thương hiệu" },
          ],
        },
      },
      add: [
        { name: "title_en", label: "Tên mục lục (EN)", type: "text", target: "node", tab: TAB },
        {
          name: "content_en",
          label: "Nội dung Page (EN)",
          type: "editor",
          height: 400,
          tab: TAB,
          props: { show: ["page", "document"] },
        },
        {
          name: "description_en",
          label: "Mô tả (EN)",
          type: "editor",
          height: 300,
          tab: TAB,
          props: { hide: ["page", "link"] },
        },
        ...seo,
      ],
    }),
  hang: (def) =>
    patch(def, {
      title: "Thương hiệu",
      columns: ["active_category"],
      add: [{ name: "website", label: "Website", type: "text", placeholder: "https://" }],
    }),
  faq: (def) => patch(def, { hide: ["description", "description_en"] }),
  contact: (def) => patch(def, { title: "Liên hệ & báo giá" }),
  rate: (def) => {
    const next = patch(def, {
      title: "Đánh giá khách hàng",
      replace: [
        { name: "title", label: "Nhãn (VD: Khách hàng sản xuất)", type: "text", required: true },
        { name: "description", label: "Lời đánh giá", type: "textarea", rows: 5, required: true },
        { name: "fullname", label: "Họ tên", type: "text", required: true },
        { name: "nghenghiep", label: "Chức danh – Công ty", type: "text" },
        { name: "title_en", label: "Nhãn (EN)", type: "text", tab: TAB },
        { name: "description_en", label: "Lời đánh giá (EN)", type: "textarea", rows: 5, tab: TAB },
        { name: "fullname_en", label: "Họ tên (EN)", type: "text", tab: TAB },
        { name: "nghenghiep_en", label: "Chức danh – Công ty (EN)", type: "text", tab: TAB },
      ],
    });
    const before = def.hooks?.beforeSave;
    return {
      ...next,
      list: {
        ...next.list,
        columns: [
          { name: "title", label: "Nhãn", link: true },
          { name: "fullname", label: "Họ tên" },
          { name: "nghenghiep", label: "Chức danh – Công ty" },
          { name: "pos", label: "Vị trí", kind: "pos" },
          { name: "status", label: "Duyệt", kind: "toggle" },
        ],
      },
      hooks: {
        ...def.hooks,
        beforeSave: async (data, ctx) => {
          const sent = { ...data.main };
          await before?.(data, ctx);
          for (const k of Object.keys(sent)) if (k.endsWith("_en")) data.main[k] = sent[k];
        },
      },
    };
  },
};

export function siteModule(def: ModuleDef): ModuleDef {
  return patches[def.key]?.(def) ?? def;
}
