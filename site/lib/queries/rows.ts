import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";

const order = () => [{ pos: "desc" as const }, { id: "desc" as const }];

export async function getHangs() {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  return db.hangs.findMany({ where: { status: 1 }, orderBy: order() });
}

export async function featuredHangs(limit: number) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  return db.hangs.findMany({ where: { featured: 1, status: 1 }, orderBy: order(), take: limit });
}

export async function getFaqs(limit: number) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  return db.faqs.findMany({ where: { status: 1 }, orderBy: order(), take: limit });
}

export async function getRates(limit: number) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  return db.rates.findMany({ where: { status: 1 }, orderBy: order(), take: limit });
}
