import { db } from "@/db";
import { oficinaSignups } from "@/db/schema";
import { isEmail, json, readBody, str } from "@/lib/api";

export async function POST(req: Request) {
  const b = await readBody(req);
  const name = str(b.name, 120);
  const email = str(b.email, 160)?.toLowerCase();
  const whatsapp = str(b.whatsapp, 30);
  const level = str(b.level, 40);
  if (!name || !email || !isEmail(email) || !whatsapp || !level)
    return json({ error: "Preencha nome, e-mail válido, WhatsApp e seu nível." }, 400);
  await db.insert(oficinaSignups).values({
    name,
    email,
    whatsapp,
    level,
    instrument: str(b.instrument, 60),
    message: str(b.message, 1000),
  });
  return json({ ok: true });
}
