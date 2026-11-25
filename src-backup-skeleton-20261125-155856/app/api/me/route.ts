import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { CATEGORIES, json, readBody, str } from "@/lib/api";

export async function PATCH(req: Request) {
  const me = await getCurrentUser();
  if (!me) return json({ error: "Faça login para continuar." }, 401);
  const b = await readBody(req);
  const category = str(b.category, 20);
  const set: Partial<typeof users.$inferInsert> = {};

  const firstName = str(b.firstName, 80);
  const lastName = str(b.lastName, 120);
  if (!firstName || !lastName) return json({ error: "Nome e sobrenome são obrigatórios." }, 400);
  set.firstName = firstName;
  set.lastName = lastName;
  set.stageName = str(b.stageName, 80);
  set.birthDate = str(b.birthDate, 10);
  set.birthPlace = str(b.birthPlace, 120);
  set.address = str(b.address, 200);
  set.city = str(b.city, 100);
  set.state = str(b.state, 40);
  set.zip = str(b.zip, 12);
  set.phone = str(b.phone, 30);
  set.gender = str(b.gender, 30);
  set.silhouette = b.silhouette === "f" ? "f" : "m";
  set.instrument = str(b.instrument, 60);
  set.bio = str(b.bio, 2000);
  set.instagram = str(b.instagram, 60)?.replace(/^@/, "") ?? null;
  set.whatsapp = str(b.whatsapp, 30);
  set.showContact = b.showContact !== false;
  set.bloodType = str(b.bloodType, 6);
  set.emergencyName = str(b.emergencyName, 120);
  set.emergencyPhone = str(b.emergencyPhone, 30);
  set.shirtSize = str(b.shirtSize, 6);
  if (category && (CATEGORIES as readonly string[]).includes(category)) {
    if (category === "fundador" && me.joinYear !== 2013)
      return json({ error: "Somente quem ingressou em 2013 pode ser fundador." }, 400);
    set.category = category;
    set.leftYear = category === "ex" && Number(b.leftYear) >= me.joinYear ? Number(b.leftYear) : null;
  }
  await db.update(users).set(set).where(eq(users.id, me.id));
  return json({ ok: true });
}
