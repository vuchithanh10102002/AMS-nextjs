const mariadb = require("mariadb");

try {
  process.loadEnvFile(".env.local");
} catch {
  console.log("Không tìm thấy .env.local ở thư mục gốc dự án");
  process.exit(1);
}

const e = process.env;
const cfg = {
  host: e.DB_HOST ?? "127.0.0.1",
  port: Number(e.DB_PORT ?? 3306),
  user: e.DB_USER ?? "root",
  password: e.DB_PASS ?? "",
  database: e.DB_NAME,
  allowPublicKeyRetrieval: true,
  connectTimeout: 10000,
};

const hints = {
  ECONNREFUSED: "MySQL chưa chạy, hoặc sai DB_HOST/DB_PORT",
  ETIMEDOUT: "Không tới được máy MySQL (sai host, tường lửa)",
  ER_ACCESS_DENIED_ERROR: "Sai DB_USER hoặc DB_PASS",
  ER_BAD_DB_ERROR: "Chưa có database " + cfg.database + ", tạo DB rồi import database/ams.sql",
  ER_NOT_SUPPORTED_AUTH_MODE: "User MySQL dùng kiểu xác thực driver không hỗ trợ",
};

(async () => {
  console.log(`Kết nối ${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database ?? "(thiếu DB_NAME)"}`);
  if (!cfg.database) {
    console.log("Thiếu DB_NAME trong .env.local");
    process.exit(1);
  }
  let conn;
  try {
    conn = await mariadb.createConnection(cfg);
    const [v] = await conn.query("SELECT VERSION() AS v");
    const [n] = await conn.query("SELECT COUNT(*) AS n FROM langs");
    console.log(`OK: ${v.v}, bảng langs có ${n.n} dòng`);
  } catch (err) {
    console.log(`LỖI ${err.code ?? ""}: ${err.message}`);
    if (hints[err.code]) console.log("=> " + hints[err.code]);
    else if (err.code === "ER_NO_SUCH_TABLE") console.log("=> DB rỗng, import database/ams.sql");
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
})();
