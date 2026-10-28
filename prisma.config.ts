import { defineConfig } from "prisma/config";

try {
  process.loadEnvFile(".env.local");
} catch {}

const e = process.env;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: `mysql://${encodeURIComponent(e.DB_USER ?? "root")}:${encodeURIComponent(e.DB_PASS ?? "")}@${e.DB_HOST ?? "127.0.0.1"}:${e.DB_PORT ?? 3306}/${e.DB_NAME}`,
  },
});
