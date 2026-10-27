const fs = require("fs");
const path = require("path");
const { createHmac } = require("crypto");
const mysql = require("mysql2/promise");

const root = path.resolve(process.argv[2] || ".");
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")]),
);
const base = (process.argv[3] || env.SITE_URL || "http://localhost:3000/").replace(/\/?$/, "/");
const ORDER = ["text", "category", "textarea", "text_link", "textarea_link", "editor", "image", "image_link", "image_link_text"];

function session(id) {
  const payload = Buffer.from(JSON.stringify({ id, exp: Date.now() + 3600 * 1000 })).toString("base64url");
  return `${payload}.${createHmac("sha256", env.SESSION_SECRET).update(payload).digest("base64url")}`;
}

(async () => {
  const db = await mysql.createConnection({ host: env.DB_HOST, port: Number(env.DB_PORT || 3306), user: env.DB_USER, password: env.DB_PASS, database: env.DB_NAME });
  const [admins] = await db.query("SELECT id FROM admins ORDER BY id ASC LIMIT 1");
  const [nodes] = await db.query("SELECT slug FROM nodes WHERE status = 1 AND slug <> '' ORDER BY id");
  await db.end();
  const urls = ["", "lien-he", "search?s=a", "404.html", ...nodes.map((n) => `${n.slug}.html`)];
  const cookie = `nh_admin=${session(admins[0].id)}; active_editor=1`;
  const found = new Map();
  let failed = 0;
  const queue = [...urls];
  const worker = async () => {
    for (let u = queue.shift(); u !== undefined; u = queue.shift()) {
      const res = await fetch(base + u, { headers: { cookie, "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140" }, redirect: "manual" }).catch(() => null);
      if (!res || res.status >= 400) {
        failed++;
        continue;
      }
      const html = await res.text();
      for (const m of html.matchAll(/href="[^"]*\/admin\/lang\/([^"?]+)(?:\?([a-z_]+)=1)?"/g)) {
        const key = decodeURIComponent(m[1]);
        if (!found.has(key)) found.set(key, new Set());
        found.get(key).add(m[2] || "text");
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  if (!found.size) {
    console.log("Không thấy bánh răng nào: kiểm tra site đang chạy ở " + base + " và chế độ sửa");
    process.exit(1);
  }
  const out = {};
  const mixed = [];
  for (const key of [...found.keys()].sort()) {
    const modes = [...found.get(key)].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
    out[key] = modes[modes.length - 1];
    if (modes.length > 1) mixed.push(`${key}: ${modes.join(", ")}`);
  }
  fs.writeFileSync(path.join(root, "site", "lang-modes.json"), JSON.stringify(out, null, 2) + "\n");
  console.log(`Quét ${urls.length} trang (${failed} lỗi), ghi ${Object.keys(out).length} khoá vào site/lang-modes.json`);
  if (mixed.length) console.log("Khoá có nhiều kiểu (lấy kiểu cuối):\n  " + mixed.join("\n  "));
})();
