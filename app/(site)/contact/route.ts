import { db } from "@/lib/db";

const clean = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .replace(/<[^>]*>/g, "")
    .trim();

export async function POST(request: Request) {
  const res = { res: "error", msg: "", data: [] as unknown[] };
  const form = await request.formData().catch(() => null);
  if (form && [...form.keys()].length) {
    await db.contacts.create({
      data: {
        title: clean(form.get("title")).slice(0, 255),
        fullname: clean(form.get("fullname")).slice(0, 64),
        email: clean(form.get("email")).slice(0, 64),
        address: clean(form.get("address")).slice(0, 255),
        phone: clean(form.get("phone")).slice(0, 64),
        content: clean(form.get("content")),
        status: 0,
        created: String(Math.floor(Date.now() / 1000)),
      },
    });
    res.res = "done";
    res.msg = "Gửi thông tin thành công. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất";
  }
  return Response.json(res);
}
