import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { eventRsvps, events } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Entre na Área do Integrante para confirmar presença." }, { status: 401 });

  let payload: { eventId?: number; status?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler a confirmação." }, { status: 400 });
  }

  const eventId = Number(payload.eventId);
  const status = payload.status as "going" | "unavailable";
  if (!Number.isInteger(eventId) || eventId < 1 || !["going", "unavailable"].includes(status ?? "")) {
    return NextResponse.json({ error: "Confirmação inválida." }, { status: 400 });
  }

  const [event] = await db.select({ id: events.id, startsAt: events.startsAt }).from(events).where(eq(events.id, eventId)).limit(1);
  if (!event || event.startsAt <= new Date()) {
    return NextResponse.json({ error: "Este compromisso não está mais disponível para confirmação." }, { status: 404 });
  }

  await db.insert(eventRsvps).values({
    eventId,
    memberId: user.memberId,
    status,
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: [eventRsvps.eventId, eventRsvps.memberId],
    set: { status, updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true, status });
}
