import { eq } from "drizzle-orm";
import { db } from "@/db";
import { musicInstrumentSettings, musicSoundSamples } from "@/db/schema";
import { INSTRUMENTS, EMPTY_COMPOSITION, createDefaultSoundSlot, normalizeComposition, normalizeSoundSlots, type Voice, type SoundSlot } from "@/lib/music";
import { getCurrentUser } from "@/lib/auth";
import { isMusicAdmin } from "@/lib/music-admin";
import { json, readBody } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate", Pragma: "no-cache", Expires: "0", "Content-Type": "application/json; charset=utf-8" };
const VOICES = new Set<Voice>(INSTRUMENTS.map((instrument) => instrument.id));

export async function GET() {
  const [rows, sampleRows] = await Promise.all([
    db.select({
      voice: musicInstrumentSettings.voice,
      pattern: musicInstrumentSettings.pattern,
      sampleMime: musicInstrumentSettings.sampleMime,
      sampleName: musicInstrumentSettings.sampleName,
      soundSlots: musicInstrumentSettings.soundSlots,
      composition: musicInstrumentSettings.composition,
    }).from(musicInstrumentSettings),
    db.select({ voice: musicSoundSamples.voice, slotId: musicSoundSamples.slotId, name: musicSoundSamples.sampleName }).from(musicSoundSamples),
  ]);
  const overrides = new Map(rows.map((row) => [row.voice, row]));
  const samples = new Map(sampleRows.map((row) => [`${row.voice}:${row.slotId}`, row.name]));
  const instruments: Record<string, { soundSlots: SoundSlot[]; composition: ReturnType<typeof normalizeComposition> }> = {};
  const patterns: Partial<Record<Voice, number[]>> = {};
  const legacySamples: { voice: string; name: string }[] = [];

  for (const instrument of INSTRUMENTS) {
    const row = overrides.get(instrument.id);
    let slots = normalizeSoundSlots(row?.soundSlots, instrument);
    // Keep older installations working: lift the previous instrument-wide pattern into slot 1.
    if (!row?.soundSlots && row?.pattern?.length === 16 && slots[0]) {
      slots[0] = { ...slots[0], pattern: row.pattern.map((v) => v === 1 || v === 2 ? v : 0) };
    }
    if (!row?.soundSlots && row?.sampleMime && slots[0]) slots[0] = { ...slots[0], source: "sample" };
    instruments[instrument.id] = { soundSlots: slots, composition: normalizeComposition(row?.composition ?? EMPTY_COMPOSITION) };
    patterns[instrument.id] = slots[0]?.pattern ?? instrument.pattern;
    if (row?.sampleMime) legacySamples.push({ voice: instrument.id, name: row.sampleName ?? "Gravação antiga" });
  }
  return new Response(JSON.stringify({ instruments, samples: Array.from(samples, ([key, name]) => {
    const [voice, slotId] = key.split(":");
    return { voice, slotId, name };
  }), legacySamples, patterns }), {
    headers: NO_CACHE,
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!isMusicAdmin(user)) return json({ error: "Apenas administradores autorizados podem editar o estúdio." }, user ? 403 : 401);

  const body = await readBody(req);
  const voice = typeof body.voice === "string" ? body.voice as Voice : null;
  if (!voice || !VOICES.has(voice)) return json({ error: "Instrumento não encontrado." }, 400);
  const instrument = INSTRUMENTS.find((item) => item.id === voice)!;

  if (!Array.isArray(body.soundSlots) || body.soundSlots.length > 10) {
    return json({ error: "Cada instrumento pode ter no máximo 10 tipos de som." }, 400);
  }
  const slots = normalizeSoundSlots(body.soundSlots, instrument);
  if (slots.some((slot) => !slot.name.trim() || slot.pattern.length !== 16)) {
    return json({ error: "Cada som precisa de um nome e 16 células." }, 400);
  }
  const composition = normalizeComposition(body.composition);
  const legacyPattern = slots[0]?.pattern ?? Array(16).fill(0);

  await db.insert(musicInstrumentSettings)
    .values({ voice, pattern: legacyPattern, soundSlots: slots, composition })
    .onConflictDoUpdate({
      target: musicInstrumentSettings.voice,
      set: { pattern: legacyPattern, soundSlots: slots, composition, updatedAt: new Date() },
    });
  return new Response(JSON.stringify({ ok: true, soundCount: slots.length }), {
    headers: NO_CACHE,
  });
}
