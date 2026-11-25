import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { json, readBody, str } from "@/lib/api";

export async function POST(req: Request) {
  const b = await readBody(req);
  const email = str(b.email, 160)?.toLowerCase();
  const password = typeof b.password === "string" ? b.password : "";
  if (!email || !password) return json({ error: "Informe e-mail e senha." }, 400);
  const [u] = await db
    .select({ id: users.id, hash: users.passwordHash, memberId: users.memberId })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!u || !verifyPassword(password, u.hash)) return json({ error: "E-mail ou senha incorretos." }, 401);
  await createSession(u.id);
  return json({ ok: true, memberId: u.memberId });
}
