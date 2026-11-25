import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { isMusicAdmin } from "@/lib/music-admin";

export const dynamic = "force-dynamic";

const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Entre na Área do Integrante." }, { status: 401 });
  if (!isMusicAdmin(user)) return NextResponse.json({ error: "Somente a administração autorizada pode cadastrar compromissos." }, { status: 403 });

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler os dados do compromisso." }, { status: 400 });
  }

  const title = clean(payload.title, 140);
  const dateTime = clean(payload.startsAt, 24);
  const kind = clean(payload.kind, 20);
  const allowedKinds = ["show", "ensaio", "cortejo", "oficina"];
  if (title.length < 4) return NextResponse.json({ error: "Informe um nome com pelo menos 4 caracteres." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateTime)) return NextResponse.json({ error: "Informe uma data e horário válidos." }, { status: 400 });
  if (!allowedKinds.includes(kind)) return NextResponse.json({ error: "Selecione um tipo de compromisso válido." }, { status: 400 });

  // datetime-local é interpretado como horário de Brasília (UTC−03:00).
  const startsAt = new Date(`${dateTime}:00-03:00`);
  if (!Number.isFinite(startsAt.getTime()) || startsAt <= new Date()) {
    return NextResponse.json({ error: "A data do compromisso precisa estar no futuro." }, { status: 400 });
  }

  const [created] = await db.insert(events).values({
    title,
    startsAt,
    timeLabel: clean(payload.timeLabel, 80) || null,
    location: clean(payload.location, 180) || null,
    description: clean(payload.description, 1600) || null,
    kind,
    free: payload.free !== false,
    confirmed: true,
    isDemo: false,
    concentrationAt: clean(payload.concentrationAt, 100) || null,
    dressCode: clean(payload.dressCode, 180) || null,
  }).returning({ id: events.id });

  revalidateTag("published-upcoming-events", { expire: 0 });
  return NextResponse.json({ ok: true, eventId: created.id }, { status: 201 });
}
