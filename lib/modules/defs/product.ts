import { db, table } from "@/lib/db";
import type { Field, ModuleDef, Option } from "../types";

export const productFlags = { color: false, flashsale: true };

export const RATING_LABELS = ["Mùa đông", "Mùa xuân", "Mùa hạ", "Mùa thu", "Ban ngày", "Ban đêm"];

const nullableId = (v: unknown) => (v === "" || v == null || !Number(v) ? null : Number(v));

function readVariants(form: FormData) {
  const sizes = form.getAll("v_size").map(String);
  const col = (n: string) => form.getAll(n).map((x) => Number(String(x).replace(/\D/g, "")) || 0);
  const price = form.getAll("v_price").map(String);
  const vip = col("v_vip");
  const gold = col("v_gold");
  const member = col("v_member");
  const bySize = new Map<
    number,
    {
      size_id: number;
      price: number;
      price_vip: number;
      price_gold: number;
      price_member: number;
      group_img: number;
    }
  >();
  sizes.forEach((s, i) => {
    const sizeId = Number(s);
    const p = String(price[i] ?? "").replace(/\D/g, "");
    if (!sizeId || p === "") return;
    bySize.set(sizeId, {
      size_id: sizeId,
      price: Number(p),
      price_vip: vip[i] ?? 0,
      price_gold: gold[i] ?? 0,
      price_member: member[i] ?? 0,
      group_img: i + 1,
    });
  });
  return [...bySize.values()];
}

async function syncVariants(nodeId: number, form: FormData) {
  if (!form.has("_variants")) return;
  const rows = readVariants(form);
  const keep = rows.map((r) => r.size_id);
  if (keep.length)
    await db.images.deleteMany({
      where: { node_id: nodeId, OR: [{ size_id: null }, { size_id: { notIn: keep } }] },
    });
  else await db.images.deleteMany({ where: { node_id: nodeId } });
  const existing = await db.images.findMany({
    where: { node_id: nodeId },
    select: { id: true, size_id: true },
    orderBy: { id: "asc" },
  });
  for (const r of rows) {
    const hits = existing.filter((e) => e.size_id === r.size_id);
    if (hits.length) {
      await db.images.updateMany({ where: { id: hits[0].id }, data: r });
      if (hits.length > 1)
        await db.images.deleteMany({ where: { id: { in: hits.slice(1).map((h) => h.id) } } });
    } else await db.images.create({ data: { ...r, node_id: nodeId, image: "", color_id: 0 } });
  }
}

async function syncFilters(nodeId: number, form: FormData) {
  if (!form.has("_filters")) return;
  const wanted = [
    ...new Set(
      form
        .getAll("filter_item")
        .map(Number)
        .filter((n) => n > 0),
    ),
  ];
  if (wanted.length)
    await db.filter_linkeds.deleteMany({
      where: { node_id: nodeId, filter_item_id: { notIn: wanted } },
    });
  else await db.filter_linkeds.deleteMany({ where: { node_id: nodeId } });
  const have = new Set(
    (
      await db.filter_linkeds.findMany({
        where: { node_id: nodeId },
        select: { filter_item_id: true },
      })
    ).map((r) => r.filter_item_id),
  );
  const add = wanted.filter((x) => !have.has(x));
  if (add.length)
    await db.filter_linkeds.createMany({
      data: add.map((filter_item_id) => ({ node_id: nodeId, filter_item_id })),
    });
}

export async function copyProductLinks(newId: number, srcId: number) {
  const images = await db.images.findMany({
    where: { node_id: srcId },
    select: {
      image: true,
      color_id: true,
      size_id: true,
      price: true,
      price_off: true,
      price_vip: true,
      price_gold: true,
      price_member: true,
      group_img: true,
    },
  });
  if (images.length)
    await db.images.createMany({ data: images.map((i) => ({ ...i, node_id: newId })) });
  const links = await db.filter_linkeds.findMany({
    where: { node_id: srcId },
    select: { filter_item_id: true },
  });
  if (links.length)
    await db.filter_linkeds.createMany({
      data: links.map((l) => ({ node_id: newId, filter_item_id: l.filter_item_id })),
    });
}

export async function deleteProductLinks(ids: number[]) {
  if (!ids.length) return;
  await db.images.deleteMany({ where: { node_id: { in: ids } } });
  await db.filter_linkeds.deleteMany({ where: { node_id: { in: ids } } });
  await db.wishlists.deleteMany({ where: { product_node_id: { in: ids } } });
  await db.comments.deleteMany({ where: { node_id: { in: ids } } });
}

async function simpleOptions(name: string): Promise<Option[]> {
  const rows: { id: number; title: string | null; status: number | null }[] = await table(
    name,
  ).findMany({
    select: { id: true, title: true, status: true },
    orderBy: [{ pos: "desc" }, { id: "desc" }],
  });
  return rows.map((r) => ({
    value: String(r.id),
    label: `${(r.title ?? "").trim()}${Number(r.status) === 1 ? "" : " (ẩn)"}`,
  }));
}

const money = (name: string, label: string): Field => ({ name, label, type: "money", half: true });

const fields: Field[] = [
  { name: "title", label: "Tên sản phẩm", type: "text", required: true, maxLength: 128 },
  { name: "slug", label: "Slug", type: "slug", only: "edit", required: true },
  { name: "category_id", label: "Mục lục", type: "categories", ctype: "product", required: true },
  money("price_off", "Giá gốc (giá khởi điểm)"),
  money("price", "Giá bán"),
  money("price_vip", "Giá VIP"),
  money("price_gold", "Giá GOLD"),
  money("price_member", "Giá MEMBER"),
  { name: "hang_id", label: "Hãng", type: "select", optionsKey: "hangs", half: true },
  {
    name: "status",
    label: "Trạng thái",
    type: "select",
    default: 1,
    half: true,
    options: [
      { value: "1", label: "Hiện" },
      { value: "0", label: "Ẩn" },
    ],
  },
  {
    name: "gender",
    label: "Giới tính",
    type: "select",
    half: true,
    options: [
      { value: "Nam", label: "Nam" },
      { value: "Nữ", label: "Nữ" },
      { value: "Unisex", label: "Unisex" },
    ],
  },
  {
    name: "sizes",
    label: "Dung tích",
    type: "multiselect",
    optionsKey: "sizes",
    storage: "wrap",
    half: true,
  },
  ...(productFlags.color
    ? [
        {
          name: "colors",
          label: "Màu sẵn có",
          type: "multiselect",
          optionsKey: "colors",
          storage: "wrap",
          half: true,
        } satisfies Field,
      ]
    : []),
  ...(productFlags.flashsale
    ? [
        {
          name: "flashsale_id",
          label: "Chương trình ưu đãi",
          type: "select",
          optionsKey: "flashsales",
          half: true,
        } satisfies Field,
      ]
    : []),
  {
    name: "extra",
    label: "Đánh giá (%)",
    type: "custom",
    component: "product-rating",
    props: { labels: RATING_LABELS },
  },
  { name: "image", label: "Ảnh đại diện", type: "image" },
  { name: "images", label: "Danh sách hình ảnh", type: "gallery" },
  { name: "description", label: "Mô tả sản phẩm", type: "editor", height: 300 },
  { name: "content", label: "Nội dung", type: "editor", height: 500 },
  { name: "content_2", label: "Sử dụng & bảo quản", type: "editor", height: 300 },
  {
    name: "variants",
    label: "Bảng giá theo dung tích",
    type: "custom",
    component: "product-variants",
    optionsKey: "sizes",
    tab: "Sản phẩm con",
    help: "Mỗi dung tích một dòng giá. Dòng chưa chọn dung tích hoặc chưa có giá bán sẽ không được lưu.",
  },
  {
    name: "seo_title",
    label: "SEO Title",
    type: "text",
    tab: "Các thẻ Meta",
    help: "Để trống thì website lấy tên sản phẩm",
  },
  { name: "seo_keyword", label: "SEO Keywords", type: "text", tab: "Các thẻ Meta" },
  {
    name: "seo_description",
    label: "SEO Description",
    type: "textarea",
    rows: 5,
    tab: "Các thẻ Meta",
    help: "Để trống thì website lấy mô tả",
  },
  {
    name: "filter_items",
    label: "Bộ lọc nâng cao",
    type: "custom",
    component: "product-filters",
    optionsKey: "filterTree",
    tab: "Bộ lọc nâng cao",
  },
];

const hooks: NonNullable<ModuleDef["hooks"]> = {
  load: async (row) => {
    row.variants = await db.images.findMany({
      where: { node_id: row.id },
      select: { size_id: true, price: true, price_vip: true, price_gold: true, price_member: true },
      orderBy: [{ group_img: "asc" }, { id: "asc" }],
    });
    row.filter_items = (
      await db.filter_linkeds.findMany({
        where: { node_id: row.id },
        select: { filter_item_id: true },
      })
    ).map((r) => String(r.filter_item_id));
    return row;
  },
  beforeSave: ({ main }, ctx) => {
    if (ctx.isNew && !ctx.form.getAll("category_id").some((v) => String(v) !== ""))
      throw new Error("Vui lòng chọn Mục lục");
    if ("hang_id" in main) main.hang_id = nullableId(main.hang_id);
    if ("flashsale_id" in main) main.flashsale_id = nullableId(main.flashsale_id);
    if (ctx.form.has("_extra")) {
      const value = ctx.form
        .getAll("extra_value")
        .map((v) => String(Math.min(100, Math.max(0, Math.round(Number(v) || 0)))));
      main.extra = JSON.stringify({ text: RATING_LABELS, value });
    }
  },
  afterSave: async (id, _, ctx) => {
    await syncVariants(id, ctx.form);
    await syncFilters(id, ctx.form);
  },
  afterDelete: async (ids) => deleteProductLinks(ids),
  afterCopy: copyProductLinks,
};

export const product: ModuleDef = {
  key: "product",
  title: "Sản phẩm",
  table: "products",
  node: "product",
  icon: "package",
  positions: true,
  statusToggle: true,
  copies: true,
  previewLink: true,
  list: {
    pageSize: 20,
    order: [{ node: { pos: "desc" } }, { node: { id: "desc" } }],
    filters: [
      { kind: "search", name: "s", label: "Tìm theo tên hoặc mã", columns: ["title", "code"] },
      { kind: "category", name: "list_category", label: "Mục lục", ctype: "product" },
      { kind: "select", name: "hang_id", label: "Hãng", column: "hang_id", optionsKey: "hangs" },
      {
        kind: "select",
        name: "filter_status",
        label: "Trạng thái",
        column: "status",
        options: [
          { value: "1", label: "Đang hiện" },
          { value: "0", label: "Đang ẩn" },
        ],
      },
    ],
    toggles: ["footer_1", "footer_2", "footer_3", "footer_4", "top_search", "featured"],
    columns: [
      { name: "image", label: "Ảnh", kind: "image" },
      { name: "title", label: "Tên", link: true },
      { name: "_categories", label: "Mục lục", kind: "categories" },
      { name: "price", label: "Giá", kind: "money" },
      { name: "pos", label: "Vị trí", kind: "pos" },
      { name: "footer_1", label: "C.trang 1", kind: "toggle" },
      { name: "footer_2", label: "C.trang 2", kind: "toggle" },
      { name: "footer_3", label: "C.trang 3", kind: "toggle" },
      { name: "footer_4", label: "C.trang 4", kind: "toggle" },
      { name: "top_search", label: "Top tìm kiếm", kind: "toggle" },
      { name: "featured", label: "Nổi bật", kind: "toggle" },
      { name: "status", label: "Tr.thái", kind: "toggle" },
    ],
  },
  form: { tabs: ["Thông tin chung", "Sản phẩm con", "Các thẻ Meta", "Bộ lọc nâng cao"], fields },
  options: {
    hangs: () => simpleOptions("hangs"),
    sizes: () => simpleOptions("sizes"),
    colors: () => simpleOptions("colors"),
    flashsales: () => simpleOptions("flashsales"),
    filterTree: async () => {
      const groups = await db.filters.findMany({
        select: { id: true, title: true },
        orderBy: [{ pos: "asc" }, { id: "desc" }],
      });
      const items = await db.filter_items.findMany({
        select: { id: true, filter_id: true, title: true },
        orderBy: [{ pos: "asc" }, { id: "asc" }],
      });
      return groups.flatMap((g) => [
        { value: `g:${g.id}`, label: (g.title ?? "").trim() },
        ...items
          .filter((i) => i.filter_id === g.id)
          .map((i) => ({ value: String(i.id), label: (i.title ?? "").trim() })),
      ]);
    },
  },
  hooks,
};
