"use client";

export function ContactContent({ value }: { value: unknown }) {
  const text = String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return (
    <div className="min-h-24 whitespace-pre-wrap break-words rounded-lg border bg-muted/50 px-3 py-2 text-sm">
      {text || "—"}
    </div>
  );
}
