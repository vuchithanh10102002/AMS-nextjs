import "server-only";
import type { Plain } from "@/lib/db";
import type { nodes } from "@/prisma/generated/client";

export type Paged<T> = { rows: T[]; page: number; pages: number; total: number };

export type Entry<M> = Plain<Omit<nodes, keyof M> & Omit<M, "node_id" | "node">> & { node_id: number };

export function withNode<M>(r: M & { node: nodes | null }): Entry<M> {
  const { node, ...m } = r;
  return { ...node, ...m, node_id: node?.id } as unknown as Entry<M>;
}

export async function paged<T>(page: number, limit: number, count: () => Promise<number>, rows: (skip: number) => Promise<T[]>): Promise<Paged<T>> {
  const total = await count();
  const pages = Math.max(1, Math.ceil(total / limit));
  return { rows: page > pages ? [] : await rows((page - 1) * limit), page, pages, total };
}

export const outOfRange = (d: Paged<unknown>) => d.page > d.pages;

export const nodeOrder = () => [{ node: { pos: "desc" as const } }, { node: { id: "desc" as const } }];
