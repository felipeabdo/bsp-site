import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { json, readBody } from "@/lib/api";

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return json({ error: "Faça login para continuar." }, 401);
  const b = await readBody(req);
  const current = typeof b.current === "string" ? b.current : "";
  const next = typeof b.next === "string" ? b.next : "";
  if (next.length < 8) return json({ error: "A nova senha precisa ter pelo menos 8 caracteres." }, 400);
  const [row] = await db.select({ hash: users.passwordHash }).from(users).where(eq(users.id, me.id)).limit(1);
  if (!verifyPassword(current, row?.hash ?? null)) return json({ error: "Senha atual incorreta." }, 400);
  await db.update(users).set({ passwordHash: hashPassword(next) }).where(eq(users.id, me.id));
  return json({ ok: true });
}
