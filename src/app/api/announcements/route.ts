import { NextResponse } from "next/server";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { isMusicAdmin } from "@/lib/music-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sessão encerrada. Entre novamente." }, { status: 401 });
  if (!isMusicAdmin(user)) return NextResponse.json({ error: "Somente a administração autorizada pode publicar avisos." }, { status: 403 });

  let payload: { title?: string; body?: string; pinned?: boolean };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler o comunicado." }, { status: 400 });
  }

  const title = String(payload.title ?? "").trim();
  const body = String(payload.body ?? "").trim();
  if (title.length < 4 || title.length > 120 || body.length < 8 || body.length > 2500) {
    return NextResponse.json({ error: "Informe um título (4 a 120 caracteres) e um comunicado (8 a 2.500 caracteres)." }, { status: 400 });
  }

  const [notice] = await db.insert(announcements).values({
    title,
    body,
    author: "Mestre & Diretoria",
    pinned: Boolean(payload.pinned),
    published: true,
  }).returning();

  return NextResponse.json({ ok: true, announcement: notice }, { status: 201 });
}
