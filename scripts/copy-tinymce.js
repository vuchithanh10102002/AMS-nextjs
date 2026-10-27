const fs = require("fs");
const path = require("path");
const src = path.join(__dirname, "..", "node_modules", "tinymce");
const dst = path.join(__dirname, "..", "public", "tinymce");
fs.rmSync(dst, { recursive: true, force: true });
fs.cpSync(src, dst, { recursive: true, filter: (p) => !/\.(md|json)$/.test(p) || p.endsWith("tinymce.min.js") });
