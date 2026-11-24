import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { musicAssignments, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { isMusicAdmin } from "@/lib/music-admin";
import { INSTRUMENTS, normalizeComposition, type Voice } from "@/lib/music";
import { json, readBody, str } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Entre na sua conta para ver seus estudos." }, 401);
  const columns = {
    id: musicAssignments.id,
    title: musicAssignments.title,
    instrument: musicAssignments.instrument,
    bpm: musicAssignments.bpm,
    pattern: musicAssignments.pattern,
    composition: musicAssignments.composition,
    description: musicAssignments.description,
    assignedBy: musicAssignments.assignedBy,
    recipientMemberId: musicAssignments.recipientMemberId,
    createdAt: musicAssignments.createdAt,
  };
  const rows = isMusicAdmin(user)
    ? await db.select(columns).from(musicAssignments).orderBy(desc(musicAssignments.createdAt)).limit(100)
    : await db.select(columns).from(musicAssignments).where(eq(musicAssignments.recipientMemberId, user.memberId)).orderBy(desc(musicAssignments.createdAt));
  return json({ assignments: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isMusicAdmin(user)) return json({ error: "Apenas administradores autorizados podem enviar estudos." }, user ? 403 : 401);
  const body = await readBody(req);
  const title = str(body.title, 100);
  const description = str(body.description, 1200);
  const instrument = typeof body.instrument === "string" ? body.instrument as Voice : null;
  const recipientsRaw = Array.isArray(body.recipientMemberIds) ? body.recipientMemberIds : [];
  const recipients = [...new Set(recipientsRaw.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean))].slice(0, 50);
  const pattern = body.pattern;
  const bpm = typeof body.bpm === "number" ? Math.round(body.bpm) : 92;
  if (!title) return json({ error: "Dê um nome para o estudo." }, 400);
  if (!instrument || !INSTRUMENTS.some((item) => item.id === instrument)) return json({ error: "Escolha um instrumento válido." }, 400);
  if (!recipients.length) return json({ error: "Informe ao menos um ID de integrante." }, 400);
  if (!Array.isArray(pattern) || pattern.length !== 16 || !pattern.every((value) => Number.isInteger(value) && [0, 1, 2].includes(value))) return json({ error: "A batida precisa ter 16 células válidas." }, 400);
  if (bpm < 40 || bpm > 220) return json({ error: "O andamento deve estar entre 40 e 220 BPM." }, 400);

  const knownMembers = await db.select({ memberId: users.memberId }).from(users).where(inArray(users.memberId, recipients));
  const known = new Set(knownMembers.map((item) => item.memberId));
  const missing = recipients.filter((memberId) => !known.has(memberId));
  if (missing.length) return json({ error: `Não encontrei estes IDs: ${missing.join(", ")}. Confira a numeração.` }, 400);

  const composition = normalizeComposition(body.composition);
  const created = await db.insert(musicAssignments).values(recipients.map((recipientMemberId) => ({
    title,
    recipientMemberId,
    instrument,
    bpm,
    pattern: pattern as number[],
    composition,
    description,
    assignedBy: user.memberId,
  }))).returning({ id: musicAssignments.id, recipientMemberId: musicAssignments.recipientMemberId });
  return json({ ok: true, created: created.length, recipients: created.map((item) => item.recipientMemberId) });
}
