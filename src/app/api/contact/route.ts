import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { isEmail, json, readBody, str } from "@/lib/api";

export async function POST(req: Request) {
  const b = await readBody(req);
  const name = str(b.name, 120);
  const email = str(b.email, 160)?.toLowerCase();
  const subject = str(b.subject, 120);
  const message = str(b.message, 4000);
  if (!name || !email || !isEmail(email) || !subject || !message)
    return json({ error: "Preencha nome, e-mail válido, assunto e mensagem." }, 400);
  await db.insert(contactMessages).values({ name, email, subject, message });
  return json({ ok: true });
}
