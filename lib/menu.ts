import { menuTitles, offModules } from "@/site/admin";

export type MenuItem = { title: string; url: string; icon: string; badge?: "orders" | "contacts"; add?: boolean };
export type MenuGroup = { title: string; items: MenuItem[] };

const coreMenu: MenuGroup[] = [
  {
    title: "Nội dung",
    items: [
      { title: "Mục lục", url: "/admin/category", icon: "folder-tree", add: true },
      { title: "Sản phẩm", url: "/admin/product", icon: "package", add: true },
      { title: "Bài viết", url: "/admin/news", icon: "newspaper", add: true },
      { title: "Hãng", url: "/admin/hang", icon: "store", add: true },
      { title: "Combo", url: "/admin/combo", icon: "boxes", add: true },
      { title: "Dung tích", url: "/admin/size", icon: "flask-conical", add: true },
      { title: "Bộ lọc nâng cao", url: "/admin/filter", icon: "list-filter", add: true },
      { title: "Video", url: "/admin/video", icon: "clapperboard", add: true },
      { title: "Tag", url: "/admin/tag", icon: "tags", add: true },
      { title: "Màu sắc", url: "/admin/color", icon: "palette", add: true },
      { title: "Coupon", url: "/admin/coupon", icon: "ticket-percent", add: true },
      { title: "Chương trình ưu đãi", url: "/admin/flashsale", icon: "zap", add: true },
      { title: "Bình luận", url: "/admin/comment", icon: "message-square" },
    ],
  },
  {
    title: "Liên hệ",
    items: [
      { title: "Đơn hàng", url: "/admin/cart", icon: "shopping-cart", badge: "orders" },
      { title: "Liên hệ", url: "/admin/contact", icon: "mail", badge: "contacts" },
      { title: "Đăng ký nhận tin", url: "/admin/subcriber", icon: "mail-plus" },
    ],
  },
  {
    title: "Tài khoản",
    items: [{ title: "User", url: "/admin/customer", icon: "users" }],
  },
  {
    title: "Media",
    items: [{ title: "Banner", url: "/admin/banner", icon: "image", add: true }],
  },
  {
    title: "Mở rộng",
    items: [
      { title: "Đội ngũ", url: "/admin/team", icon: "contact", add: true },
      { title: "Câu hỏi thường gặp", url: "/admin/faq", icon: "circle-help", add: true },
      { title: "Tuyển dụng", url: "/admin/rate", icon: "briefcase", add: true },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { title: "Cấu hình", url: "/admin/setting", icon: "settings" },
      { title: "Khoá giao diện", url: "/admin/lang", icon: "languages" },
      { title: "Tài khoản quản trị", url: "/admin/account", icon: "shield-user", add: true },
      { title: "Tỉnh/Thành phố", url: "/admin/city", icon: "map-pin", add: true },
      { title: "Quận huyện", url: "/admin/district", icon: "map", add: true },
      { title: "Miền", url: "/admin/mien", icon: "map-pinned", add: true },
    ],
  },
];

export const menu: MenuGroup[] = coreMenu
  .map((g) => ({
    ...g,
    items: g.items.filter((i) => !offModules.includes(key(i))).map((i) => ({ ...i, title: menuTitles[key(i)] ?? i.title })),
  }))
  .filter((g) => g.items.length);

function key(i: MenuItem) {
  return i.url.split("/")[2];
}

export function menuFor(allowed: (perm: string) => boolean) {
  return menu
    .map((g) => ({ ...g, items: g.items.filter((i) => allowed(i.url.split("/")[2])) }))
    .filter((g) => g.items.length);
}
