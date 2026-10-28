"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

type Reply = {
  id: number;
  fullname: string | null;
  content: string | null;
  status: number;
  created: number | null;
};

export function CommentReplies({ value }: { value: unknown }) {
  const replies = Array.isArray(value) ? (value as Reply[]) : [];
  if (!replies.length) return <p className="text-sm text-muted-foreground">Chưa có trả lời</p>;
  return (
    <div className="flex flex-col gap-2">
      {replies.map((r) => (
        <div key={r.id} className="rounded-lg border bg-muted/40 p-3 text-sm">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/comment/${r.id}`}
              className="font-medium hover:text-primary hover:underline"
            >
              {r.fullname || "—"}
            </Link>
            <span className="text-xs text-muted-foreground">
              {r.created ? new Date(r.created * 1000).toLocaleString("vi-VN") : ""}
            </span>
            <Badge variant={Number(r.status) === 1 ? "default" : "secondary"}>
              {Number(r.status) === 1 ? "Đã duyệt" : "Chờ duyệt"}
            </Badge>
          </div>
          <div className="whitespace-pre-wrap break-words">
            {String(r.content ?? "").replace(/<[^>]+>/g, "")}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommentReply({ field }: { field: { name: string } }) {
  return (
    <Textarea
      name={field.name}
      rows={3}
      placeholder="Nhập nội dung trả lời, bấm Hoàn tất để gửi (trả lời được duyệt ngay)"
    />
  );
}
