import { menu } from "./menu";

export const breadcrumbLabels: Record<string, string> = {
  admin: "Quản trị",
  add: "Thêm mới",
  edit: "Sửa",
  account: "Tài khoản",
  profile: "Thông tin tài khoản",
  ...Object.fromEntries(
    menu.flatMap((g) => g.items.map((i) => [i.url.split("/").pop()!, i.title])),
  ),
};
