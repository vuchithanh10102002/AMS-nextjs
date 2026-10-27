import { distinctOptions } from "@/lib/crud";
import { exec, first, query } from "@/lib/db";
import type { ModuleDef } from "../types";

const approve = [
  { value: "1", label: "Đã duyệt" },
  { value: "0", label: "Chờ duyệt" },
];

export const comment: ModuleDef = {
  key: "comment",
  title: "Bình luận",
  table: "comments",
  adds: false,
  statusToggle: true,
  list: {
    pageSize: 12,
    order: "m.id DESC",
    filters: [
      { kind: "search", name: "s", label: "Tìm theo nội dung, họ tên", columns: ["content", "fullname"] },
      { kind: "select", name: "node_id", label: "Bài viết / sản phẩm", column: "node_id", optionsKey: "nodes" },
      { kind: "select", name: "status", label: "Trạng thái", column: "status", options: approve },
    ],
    columns: [
      { name: "fullname", label: "Họ và tên", link: true },
      { name: "_node", label: "Bài viết" },
      { name: "content", label: "Nội dung", kind: "html" },
      { name: "stars", label: "Sao", kind: "number" },
      { name: "_reply", label: "Trả lời" },
      { name: "created", label: "Ngày", kind: "datetime" },
      { name: "status", label: "Duyệt", kind: "toggle" },
    ],
  },
  options: {
    nodes: () =>
      distinctOptions(
        "SELECT n.id value, CONCAT(n.title, ' (', n.type, ')') label FROM nodes n WHERE n.id IN (SELECT node_id FROM comments) ORDER BY n.title",
      ),
  },
  form: {
    fields: [
      { name: "_node", label: "Bài viết / sản phẩm", type: "readonly" },
      { name: "_parent", label: "Trả lời cho", type: "readonly" },
      { name: "fullname", label: "Họ và tên", type: "text", required: true, half: true },
      { name: "email", label: "Email", type: "text", half: true },
      { name: "phone", label: "Điện thoại", type: "text", half: true },
      { name: "stars", label: "Số sao", type: "select", half: true, options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} sao` })) },
      { name: "_created", label: "Ngày gửi", type: "readonly", half: true },
      { name: "status", label: "Đã duyệt", type: "switch", half: true },
      { name: "images", label: "Ảnh đính kèm", type: "gallery" },
      { name: "content", label: "Nội dung", type: "editor", height: 300 },
      { name: "_replies", label: "Các trả lời", type: "custom", component: "comment-replies" },
      { name: "reply", label: "Trả lời bình luận này", type: "custom", component: "comment-reply", only: "edit" },
    ],
  },
  hooks: {
    decorate: async (rows) => {
      const nodeIds = [...new Set(rows.map((r) => Number(r.node_id)).filter(Boolean))];
      const nodes = nodeIds.length ? await query<{ id: number; title: string }>("SELECT id, title FROM nodes WHERE id IN (?)", [nodeIds]) : [];
      const titles = new Map(nodes.map((n) => [n.id, n.title]));
      for (const r of rows) {
        r._node = titles.get(Number(r.node_id)) ?? (r.node_id ? `#${r.node_id} (đã xoá)` : "—");
        r._reply = Number(r.parent_id) ? `Trả lời #${r.parent_id}` : "";
      }
    },
    load: async (row) => {
      const node = row.node_id ? await first<{ title: string; type: string }>("SELECT title, type FROM nodes WHERE id = ?", [row.node_id]) : null;
      row._node = node ? `${node.title} (${node.type})` : row.node_id ? `#${row.node_id} (đã xoá)` : "—";
      const parent = Number(row.parent_id) ? await first<{ id: number; fullname: string }>("SELECT id, fullname FROM comments WHERE id = ?", [row.parent_id]) : null;
      row._parent = parent ? `#${parent.id} – ${parent.fullname ?? ""}` : "—";
      row._created = Number(row.created) ? new Date(Number(row.created) * 1000).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "—";
      row._replies = await query("SELECT id, fullname, content, status, created FROM comments WHERE parent_id = ? ORDER BY id", [row.id]);
      return row;
    },
    afterSave: async (id, _data, ctx) => {
      const reply = String(ctx.form.get("reply") ?? "").trim();
      if (!reply || !ctx.before) return;
      await exec("INSERT INTO comments SET ?", [
        {
          node_id: ctx.before.node_id,
          parent_id: id,
          fullname: ctx.admin.fullname || ctx.admin.username,
          email: ctx.admin.email ?? "",
          content: reply,
          stars: 5,
          created: Math.floor(Date.now() / 1000),
          status: 1,
        },
      ]);
    },
    afterDelete: async (ids) => {
      let parents = ids;
      while (parents.length) {
        parents = (await query<{ id: number }>("SELECT id FROM comments WHERE parent_id IN (?)", [parents])).map((c) => c.id);
        if (parents.length) await exec("DELETE FROM comments WHERE id IN (?)", [parents]);
      }
    },
  },
};
