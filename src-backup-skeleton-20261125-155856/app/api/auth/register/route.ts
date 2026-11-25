import { sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { CATEGORIES, isEmail, json, readBody, str } from "@/lib/api";
import { ensureSeed, formatMemberId, nextSequence } from "@/lib/members";

export async function POST(req: Request) {
  const b = await readBody(req);
  const email = str(b.email, 160)?.toLowerCase() ?? "";
  const password = typeof b.password === "string" ? b.password : "";
  const firstName = str(b.firstName, 80);
  const lastName = str(b.lastName, 120);
  const birthDate = str(b.birthDate, 10);
  const birthPlace = str(b.birthPlace, 120);
  const joinYear = Number(b.joinYear);
  const category = str(b.category, 20) ?? "atual";
  const currentYear = new Date().getFullYear();

  if (!isEmail(email)) return json({ error: "Informe um e-mail válido." }, 400);
  if (password.length < 8) return json({ error: "A senha precisa ter pelo menos 8 caracteres." }, 400);
  if (!firstName || !lastName) return json({ error: "Informe nome e sobrenome." }, 400);
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return json({ error: "Informe a data de nascimento." }, 400);
  if (!birthPlace) return json({ error: "Informe o local de nascimento." }, 400);
  if (!Number.isInteger(joinYear) || joinYear < 2013 || joinYear > currentYear)
    return json({ error: `O ano de ingresso deve estar entre 2013 e ${currentYear}.` }, 400);
  if (!(CATEGORIES as readonly string[]).includes(category)) return json({ error: "Categoria inválida." }, 400);
  if (category === "fundador" && joinYear !== 2013)
    return json({ error: "Fundadores ingressaram em 2013. Ajuste o ano de ingresso." }, 400);

  await ensureSeed();

  try {
    const created = await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(${1000 + joinYear}::bigint)`);
      const seq = await nextSequenceTx(joinYear, tx);
      const memberId = formatMemberId(joinYear, seq);
      const silhouette = b.silhouette === "f" ? "f" : "m";
      const [row] = await tx
        .insert(users)
        .values({
          memberId,
          joinYear,
          seq,
          email,
          passwordHash: hashPassword(password),
          firstName,
          lastName,
          stageName: str(b.stageName, 80),
          birthDate,
          birthPlace,
          address: str(b.address, 200),
          city: str(b.city, 100),
          state: str(b.state, 40),
          zip: str(b.zip, 12),
          phone: str(b.phone, 30),
          gender: str(b.gender, 30),
          silhouette,
          category,
          instrument: str(b.instrument, 60),
          leftYear: category === "ex" && Number(b.leftYear) >= joinYear ? Number(b.leftYear) : null,
          bio: str(b.bio, 2000),
          instagram: str(b.instagram, 60)?.replace(/^@/, "") ?? null,
          whatsapp: str(b.whatsapp, 30),
          bloodType: str(b.bloodType, 6),
          emergencyName: str(b.emergencyName, 120),
          emergencyPhone: str(b.emergencyPhone, 30),
          shirtSize: str(b.shirtSize, 6),
        })
        .returning({ id: users.id, memberId: users.memberId });
      return row;
    });
    await createSession(created.id);
    return json({ ok: true, memberId: created.memberId });
  } catch (e) {
    const msg = String((e as { message?: string }).message ?? e);
    if (msg.includes("users_email_unique") || msg.includes("duplicate key"))
      return json({ error: "Já existe um cadastro com esse e-mail." }, 409);
    console.error(e);
    return json({ error: "Não foi possível concluir o cadastro. Tente novamente." }, 500);
  }
}

async function nextSequenceTx(year: number, tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) {
  const res = await tx.execute(
    sql`select coalesce(max(seq), 0) as max from users where join_year = ${year} and is_demo = false`,
  );
  const max = Number((res.rows[0] as { max: number | string }).max);
  void nextSequence;
  return max + 1;
}
