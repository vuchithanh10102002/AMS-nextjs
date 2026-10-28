const fs = require("fs");
const path = require("path");

const core = path.resolve(__dirname, "..");
const target = path.resolve(process.argv[2] || "");
const dry = process.argv.includes("--dry");

if (!process.argv[2] || target === core || !fs.existsSync(path.join(target, "package.json"))) {
  console.log("Cách dùng: node scripts/sync-core.js <thư mục dự án> [--dry]");
  process.exit(1);
}

const SKIP = new Set([
  "node_modules",
  ".next",
  ".env.local",
  "next-env.d.ts",
  "tsconfig.tsbuildinfo",
  "package-lock.json",
  "package.json",
  "site",
  "app/(site)",
  "public/theme",
  "docs",
]);

const changed = [];
const added = [];

function walk(rel) {
  if (SKIP.has(rel.split(path.sep).join("/"))) return;
  const src = path.join(core, rel);
  const dst = path.join(target, rel);
  if (fs.statSync(src).isDirectory()) {
    for (const name of fs.readdirSync(src)) walk(path.join(rel, name));
    return;
  }
  const a = fs.readFileSync(src);
  if (fs.existsSync(dst) && Buffer.compare(a, fs.readFileSync(dst)) === 0) return;
  (fs.existsSync(dst) ? changed : added).push(rel);
  if (dry) return;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, a);
}

for (const name of fs.readdirSync(core)) walk(name);

const pkg = (p) => JSON.parse(fs.readFileSync(path.join(p, "package.json"), "utf8"));
const missing = Object.entries({ ...pkg(core).dependencies, ...pkg(core).devDependencies }).filter(
  ([k]) => !{ ...pkg(target).dependencies, ...pkg(target).devDependencies }[k],
);

console.log(`${dry ? "[thử] " : ""}cập nhật ${changed.length}, thêm mới ${added.length}`);
for (const f of changed) console.log("  ~ " + f);
for (const f of added) console.log("  + " + f);
if (missing.length)
  console.log(
    "Thiếu thư viện core trong package.json dự án: " +
      missing.map(([k, v]) => `${k}@${v}`).join(" "),
  );
