const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "prisma");
const file = path.join(dir, "schema.prisma");

const RELATIONS = [
  ["products", "node", "node_id", "nodes", "products"],
  ["news", "node", "node_id", "nodes", "news"],
  ["categories", "node", "node_id", "nodes", "categories"],
  ["category_linkeds", "node", "node_id", "nodes", "category_linkeds"],
  ["category_linkeds", "category", "category_id", "categories", "category_linkeds"],
  ["combos", "node", "node_id", "nodes", "combos"],
  ["comments", "node", "node_id", "nodes", "comments"],
  ["filter_linkeds", "node", "node_id", "nodes", "filter_linkeds"],
  ["filter_linkeds", "item", "filter_item_id", "filter_items", "filter_linkeds"],
  ["filter_items", "filter", "filter_id", "filters", "filter_items"],
  ["images", "node", "node_id", "nodes", "images"],
  ["orders", "node", "node_id", "nodes", "orders"],
  ["orders", "bill", "bill_id", "order_bills", "orders"],
  ["rates", "node", "node_id", "nodes", "rates"],
  ["tags", "node", "node_id", "nodes", "tags", "tag_node"],
  ["tags", "tag", "node_tag_id", "nodes", "tagged", "tag_tag"],
  ["wishlists", "node", "product_node_id", "nodes", "wishlists"],
];

let src = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");

src = src
  .replace(/^(\s+\w+\s+)Boolean(\??)(\s+@default\()(true|false)\)/gm, (_, a, q, b, v) => `${a}Int${q}${b}${v === "true" ? 1 : 0}) @db.TinyInt`)
  .replace(/^(\s+\w+\s+)Boolean(\??)(?!\S)/gm, "$1Int$2 @db.TinyInt");

function addField(model, line) {
  const start = src.indexOf(`model ${model} {\n`);
  if (start < 0) throw new Error(`Không có model ${model}`);
  const end = src.indexOf("\n}", start);
  const body = src.slice(start, end);
  if (new RegExp(`\\n\\s+${line.split(" ")[0]}\\s`).test(body)) return;
  const at = body.search(/\n\s+@@/);
  const pos = at < 0 ? end : start + at;
  src = src.slice(0, pos) + `\n  ${line}` + src.slice(pos);
}

for (const [child, field, fk, parent, back, name] of RELATIONS) {
  const rel = name ? `"${name}", ` : "";
  addField(child, `${field} ${parent}? @relation(${rel}fields: [${fk}], references: [id], onDelete: NoAction, onUpdate: NoAction)`);
  addField(parent, `${back} ${child}[]${name ? ` @relation("${name}")` : ""}`);
}

fs.writeFileSync(file, src);

const fields = {};
for (const [, model, body] of src.matchAll(/^model (\w+) \{\n([\s\S]*?)^\}/gm)) {
  fields[model] = {};
  for (const [, name, type, mod] of body.matchAll(/^\s+(\w+)\s+(\w+)(\[\]|\?)?/gm)) fields[model][name] = type + (mod ?? "");
}
fs.writeFileSync(path.join(dir, "fields.json"), JSON.stringify(fields));
