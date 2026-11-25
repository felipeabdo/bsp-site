import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { eventCheckIns, events, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { isMusicAdmin } from "@/lib/music-admin";
import { parseMemberQrToken, verifyMemberQrToken } from "@/lib/member-qr";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const admin = await getCurrentUser();
  if (!admin) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  if (!isMusicAdmin(admin)) return NextResponse.json({ error: "Acesso restrito à administração." }, { status: 403 });

  let payload: { eventId?: unknown; qrValue?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler o QR Code." }, { status: 400 });
  }

  const eventId = Number(payload.eventId);
  const qrValue = typeof payload.qrValue === "string" ? payload.qrValue.slice(0, 2048) : "";
  const parsed = parseMemberQrToken(qrValue);
  if (!Number.isInteger(eventId) || eventId < 1 || !parsed) {
    return NextResponse.json({ error: "QR Code ou evento inválido. Leia a carteirinha original do integrante." }, { status: 400 });
  }

  const [event] = await db
    .select({ id: events.id, title: events.title })
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.confirmed, true), eq(events.isDemo, false)))
    .limit(1);
  if (!event) return NextResponse.json({ error: "Evento não encontrado ou não confirmado." }, { status: 404 });

  const [member] = await db.select().from(users).where(eq(users.id, parsed.userId)).limit(1);
  if (!member || member.isDemo || !verifyMemberQrToken(parsed.token, member.id, member.memberId)) {
    return NextResponse.json({ error: "QR Code inválido, alterado ou de uma carteirinha não reconhecida." }, { status: 404 });
  }

  const [created] = await db
    .insert(eventCheckIns)
    .values({ eventId, userId: member.id, scannedBy: admin.id })
    .onConflictDoNothing()
    .returning({ id: eventCheckIns.id, scannedAt: eventCheckIns.scannedAt });

  let scannedAt = created?.scannedAt;
  if (!created) {
    const [existing] = await db
      .select({ scannedAt: eventCheckIns.scannedAt })
      .from(eventCheckIns)
      .where(and(eq(eventCheckIns.eventId, eventId), eq(eventCheckIns.userId, member.id)))
      .limit(1);
    scannedAt = existing?.scannedAt;
  }

  // Dados privados só são enviados após autenticação e autorização da administração.
  // Nenhuma informação pessoal é embutida no QR Code.
  return NextResponse.json({
    ok: true,
    alreadyCheckedIn: !created,
    scannedAt: scannedAt ?? new Date(),
    event: { id: event.id, title: event.title },
    member: {
      id: member.id,
      memberId: member.memberId,
      joinYear: member.joinYear,
      firstName: member.firstName,
      lastName: member.lastName,
      stageName: member.stageName,
      category: member.category,
      instrument: member.instrument,
      email: member.email,
      birthDate: member.birthDate,
      birthPlace: member.birthPlace,
      address: member.address,
      city: member.city,
      state: member.state,
      zip: member.zip,
      phone: member.phone,
      gender: member.gender,
      instagram: member.instagram,
      whatsapp: member.whatsapp,
      bloodType: member.bloodType,
      emergencyName: member.emergencyName,
      emergencyPhone: member.emergencyPhone,
      shirtSize: member.shirtSize,
      bio: member.bio,
      bodyPhotoType: member.bodyPhotoType,
      hasPortrait: Boolean(member.photoPortrait),
      hasBody: Boolean(member.photoBody),
      photoVersion: member.photoVersion,
      showContact: member.showContact,
      createdAt: member.createdAt,
    },
  });
}
