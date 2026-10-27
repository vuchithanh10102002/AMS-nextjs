import "server-only";
import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

const globalForDb = globalThis as unknown as { pool?: Pool };

export const pool =
  globalForDb.pool ??
  mysql.createPool({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASS ?? "",
    database: process.env.DB_NAME,
    charset: "utf8mb4",
    connectionLimit: 10,
    dateStrings: true,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export type Row = Record<string, any>;

export async function query<T = Row>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return rows as T[];
}

export async function first<T = Row>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function exec(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const [res] = await pool.query<ResultSetHeader>(sql, params);
  return res;
}

const columnCache = new Map<string, Set<string>>();

export async function columns(table: string): Promise<Set<string>> {
  const hit = columnCache.get(table);
  if (hit) return hit;
  const rows = await query<{ Field: string }>(`SHOW COLUMNS FROM \`${table}\``);
  const set = new Set(rows.map((r) => r.Field));
  columnCache.set(table, set);
  return set;
}

export async function pick(table: string, data: Row): Promise<Row> {
  const cols = await columns(table);
  const out: Row = {};
  for (const [k, v] of Object.entries(data)) if (cols.has(k) && k !== "id") out[k] = v;
  return out;
}

export async function insert(table: string, data: Row): Promise<number> {
  const row = await pick(table, data);
  const res = await exec(`INSERT INTO \`${table}\` SET ?`, [row]);
  return res.insertId;
}

export async function update(table: string, id: number | string, data: Row): Promise<void> {
  const row = await pick(table, data);
  if (!Object.keys(row).length) return;
  await exec(`UPDATE \`${table}\` SET ? WHERE id = ?`, [row, id]);
}

export async function remove(table: string, ids: (number | string)[]): Promise<void> {
  if (!ids.length) return;
  await exec(`DELETE FROM \`${table}\` WHERE id IN (?)`, [ids]);
}
