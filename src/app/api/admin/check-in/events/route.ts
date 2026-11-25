import { and, asc, eq, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { isMusicAdmin } from "@/lib/music-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentUser();
  if (!admin) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  if (!isMusicAdmin(admin)) return NextResponse.json({ error: "Acesso restrito à administração." }, { status: 403 });

  // Mantém eventos em andamento e futuros; eventos recentes seguem disponíveis
  // por sete dias para permitir corrigir uma leitura feita durante a operação.
  const entries = await db
    .select({ id: events.id, title: events.title, startsAt: events.startsAt, location: events.location })
    .from(events)
    .where(and(eq(events.confirmed, true), eq(events.isDemo, false), gte(events.startsAt, new Date(Date.now() - 7 * 86400_000))))
    .orderBy(asc(events.startsAt))
    .limit(100);

  return NextResponse.json({ events: entries });
}
