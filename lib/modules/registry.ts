import "server-only";
import type { ModuleDef } from "./types";
import { offModules, siteModule } from "@/site/admin";
import { hang } from "./defs/hang";
import { news } from "./defs/news";
import { banner } from "./defs/banner";
import { video } from "./defs/video";
import { faq } from "./defs/faq";
import { team } from "./defs/team";
import { rate } from "./defs/rate";
import { city } from "./defs/city";
import { district } from "./defs/district";
import { mien } from "./defs/mien";
import { account } from "./defs/account";
import { cart } from "./defs/cart";
import { customer } from "./defs/customer";
import { coupon } from "./defs/coupon";
import { contact } from "./defs/contact";
import { subcriber } from "./defs/subcriber";
import { comment } from "./defs/comment";
import { product } from "./defs/product";
import { size } from "./defs/size";
import { filter } from "./defs/filter";
import { flashsale } from "./defs/flashsale";
import { color } from "./defs/color";
import { category } from "./defs/category";
import { combo } from "./defs/combo";
import { tag } from "./defs/tag";

const modules: ModuleDef[] = [
  hang,
  news,
  banner,
  video,
  faq,
  team,
  rate,
  city,
  district,
  mien,
  account,
  cart,
  customer,
  coupon,
  contact,
  subcriber,
  comment,
  product,
  size,
  filter,
  flashsale,
  color,
  category,
  combo,
  tag,
]
  .filter((m) => !offModules.includes(m.perm ?? m.key))
  .map(siteModule);

const byKey = new Map(modules.map((m) => [m.key, m]));

export function getModule(key: string) {
  return byKey.get(key) ?? null;
}

export function allModules() {
  return modules;
}
