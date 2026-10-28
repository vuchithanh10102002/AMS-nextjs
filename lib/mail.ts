import "server-only";
import nodemailer from "nodemailer";
import { getSettings } from "./site";

export async function sendMail(to: string, subject: string, html: string) {
  const s = await getSettings();
  if (!s.smtp_host || !s.smtp_email) throw new Error("Chưa cấu hình SMTP (Cấu hình → Email SMTP)");
  const mode = (s.smtp_secure ?? "").trim().toLowerCase();
  const port = Number(s.smtp_port) || 587;
  const secure = mode === "ssl" || port === 465;
  const transport = nodemailer.createTransport({
    host: s.smtp_host,
    port,
    secure,
    requireTLS: mode === "tls",
    auth: { user: s.smtp_email, pass: s.smtp_pass },
  });
  await transport.sendMail({
    from: `"${s.site_name || s.title || "Website"}" <${s.smtp_email}>`,
    to,
    subject,
    html,
  });
}
