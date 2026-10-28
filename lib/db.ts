import "server-only";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/prisma/generated/client";
import schemaFields from "@/prisma/fields.json";

export type Row = Record<string, any>;

export type Plain<T> = T extends Date
  ? string
  : T extends bigint
    ? number
    : T extends (infer U)[]
      ? Plain<U>[]
      : T extends object
        ? { [K in keyof T]: Plain<T[K]> }
        : T;

const FIELDS = schemaFields as Record<string, Record<string, string>>;
const SCALARS = new Set([
  "Int",
  "Float",
  "BigInt",
  "String",
  "DateTime",
  "Decimal",
  "Json",
  "Bytes",
]);
const OPS = new Set(["equals", "not", "lt", "lte", "gt", "gte", "in", "notIn"]);
const REL_OPS = new Set(["some", "every", "none", "is", "isNot"]);
const WRITE_OPS = new Set([
  "create",
  "update",
  "updateMany",
  "upsert",
  "createMany",
  "createManyAndReturn",
  "updateManyAndReturn",
]);

function fieldType(model: string, name: string) {
  return FIELDS[model]?.[name]?.replace(/(\[\]|\?)$/, "");
}

function isFieldRef(v: unknown) {
  return !!v && typeof v === "object" && "modelName" in v && "name" in v;
}

function toNumber(type: string, v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return type === "Int" ? Math.trunc(n) : type === "BigInt" ? BigInt(Math.trunc(n)) : n;
}

function toDate(v: unknown) {
  if (v instanceof Date) return v;
  const s = String(v);
  const d = new Date(s.length <= 10 ? `${s}T00:00:00Z` : s.replace(" ", "T") + "Z");
  return Number.isNaN(d.getTime()) ? null : d;
}

function castValue(type: string, v: unknown, forWhere = false): unknown {
  if (v == null || isFieldRef(v)) return v;
  switch (type) {
    case "Int":
    case "Float":
    case "BigInt":
      if (v === "" && !forWhere) return null;
      return toNumber(type, v) ?? (forWhere ? v : null);
    case "String":
      return typeof v === "string" ? v : String(v);
    case "DateTime":
      return v === "" ? null : toDate(v);
    default:
      return v;
  }
}

function castFilter(type: string, v: unknown): unknown {
  if (v == null || typeof v !== "object" || v instanceof Date || isFieldRef(v))
    return castValue(type, v, true);
  return Object.fromEntries(
    Object.entries(v).map(([op, x]) => {
      if (op === "in" || op === "notIn")
        return [op, Array.isArray(x) ? x.map((y) => castValue(type, y, true)) : x];
      if (op === "not") return [op, castFilter(type, x)];
      return [op, OPS.has(op) ? castValue(type, x, true) : x];
    }),
  );
}

function castWhere(model: string, where: unknown): unknown {
  if (!where || typeof where !== "object") return where;
  const out: Row = {};
  for (const [k, v] of Object.entries(where)) {
    if (k === "AND" || k === "OR" || k === "NOT") {
      out[k] = Array.isArray(v) ? v.map((w) => castWhere(model, w)) : castWhere(model, v);
      continue;
    }
    const type = fieldType(model, k);
    if (!type) out[k] = v;
    else if (SCALARS.has(type)) out[k] = castFilter(type, v);
    else if (v && typeof v === "object" && Object.keys(v).some((op) => REL_OPS.has(op)))
      out[k] = Object.fromEntries(
        Object.entries(v).map(([op, w]) => [op, REL_OPS.has(op) ? castWhere(type, w) : w]),
      );
    else out[k] = castWhere(type, v);
  }
  return out;
}

function castData(model: string, data: unknown): unknown {
  if (Array.isArray(data)) return data.map((d) => castData(model, d));
  if (!data || typeof data !== "object") return data;
  const out: Row = {};
  for (const [k, v] of Object.entries(data)) {
    const raw = FIELDS[model]?.[k];
    if (!raw || !SCALARS.has(raw.replace(/\?$/, ""))) continue;
    const type = raw.replace(/\?$/, "");
    const value = v && typeof v === "object" && !(v instanceof Date) ? v : castValue(type, v);
    if (value === undefined || (value === null && !raw.endsWith("?"))) continue;
    out[k] = value;
  }
  return out;
}

function castArgs(model: string, operation: string, args: Row) {
  const next: Row = { ...args };
  if ("where" in next) next.where = castWhere(model, next.where);
  if (WRITE_OPS.has(operation) && "data" in next) next.data = castData(model, next.data);
  if (operation === "upsert") {
    next.create = castData(model, next.create);
    next.update = castData(model, next.update);
  }
  return next;
}

function plain(v: unknown): unknown {
  if (typeof v === "bigint") return Number(v);
  if (v instanceof Date) {
    const iso = v.toISOString();
    return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : iso.slice(0, 19).replace("T", " ");
  }
  if (Array.isArray(v)) return v.map(plain);
  if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) {
    for (const k of Object.keys(v)) (v as Row)[k] = plain((v as Row)[k]);
  }
  return v;
}

function create() {
  const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASS ?? "",
    database: process.env.DB_NAME,
    connectionLimit: 10,
  });
  return new PrismaClient({ adapter }).$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          return plain(await query(castArgs(model, operation, (args ?? {}) as Row)));
        },
      },
    },
  });
}

const globalForDb = globalThis as unknown as { db?: ReturnType<typeof create> };

export const db = globalForDb.db ?? create();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;

export function table(name: string): any {
  if (!FIELDS[name]) throw new Error(`Bảng không tồn tại: ${name}`);
  return (db as any)[name];
}

export function columns(name: string): Set<string> {
  return new Set(
    Object.entries(FIELDS[name] ?? {})
      .filter(([, t]) => SCALARS.has(t.replace(/\?$/, "")))
      .map(([k]) => k),
  );
}
