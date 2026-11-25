import { eq } from "drizzle-orm";
import { db } from "@/db";
import { musicInstrumentSettings } from "@/db/schema";
import { INSTRUMENTS, type Voice } from "@/lib/music";
import { getCurrentUser } from "@/lib/auth";
import { isMusicAdmin } from "@/lib/music-admin";
import { json } from "@/lib/api";

export const dynamic = "force-dynamic";
const MAX_AUDIO_BYTES = 3 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "audio/wav", "audio/wave", "audio/x-wav", "audio/mpeg", "audio/mp3",
  "audio/ogg", "audio/webm", "audio/mp4", "audio/aac", "audio/flac",
  "audio/x-flac", "audio/aiff", "audio/x-aiff", "audio/m4a", "audio/x-m4a",
]);

type RouteContext = { params: Promise<{ voice: string }> };

async function resolveVoice(context: RouteContext): Promise<Voice | null> {
  const { voice } = await context.params;
  return INSTRUMENTS.some((instrument) => instrument.id === voice) ? voice as Voice : null;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  return isMusicAdmin(user) ? null : json({ error: "Apenas administradores autorizados podem gerenciar gravações." }, user ? 403 : 401);
}

export async function GET(_req: Request, context: RouteContext) {
  const voice = await resolveVoice(context);
  if (!voice) return json({ error: "Instrumento não encontrado." }, 404);
  const [row] = await db.select({ sampleData: musicInstrumentSettings.sampleData, sampleMime: musicInstrumentSettings.sampleMime, sampleName: musicInstrumentSettings.sampleName })
    .from(musicInstrumentSettings).where(eq(musicInstrumentSettings.voice, voice)).limit(1);
  if (!row?.sampleData) return json({ error: "Este instrumento ainda não tem gravação." }, 404);
  const bytes = Buffer.from(row.sampleData, "base64");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": row.sampleMime ?? "audio/wav",
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(req: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const voice = await resolveVoice(context);
  if (!voice) return json({ error: "Instrumento não encontrado." }, 404);

  let form: FormData;
  try { form = await req.formData(); } catch { return json({ error: "Envie um arquivo de áudio válido." }, 400); }
  const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "Selecione um arquivo de áudio." }, 400);
  if (file.size < 1 || file.size > MAX_AUDIO_BYTES) return json({ error: "O áudio deve ter até 3 MB." }, 400);
  if (!ALLOWED_MIME.has(file.type)) return json({ error: "Formato não suportado. Use WAV, MP3, OGG, WebM, M4A/AAC, FLAC ou AIFF." }, 400);

  const sampleData = Buffer.from(await file.arrayBuffer()).toString("base64");
  const [existing] = await db.select({ voice: musicInstrumentSettings.voice }).from(musicInstrumentSettings).where(eq(musicInstrumentSettings.voice, voice)).limit(1);
  if (existing) {
    await db.update(musicInstrumentSettings).set({ sampleData, sampleMime: file.type, sampleName: file.name.slice(0, 180), updatedAt: new Date() }).where(eq(musicInstrumentSettings.voice, voice));
  } else {
    const instrument = INSTRUMENTS.find((item) => item.id === voice)!;
    await db.insert(musicInstrumentSettings).values({ voice, pattern: instrument.pattern, sampleData, sampleMime: file.type, sampleName: file.name.slice(0, 180) });
  }
  return json({ ok: true, name: file.name });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const voice = await resolveVoice(context);
  if (!voice) return json({ error: "Instrumento não encontrado." }, 404);
  await db.update(musicInstrumentSettings)
    .set({ sampleData: null, sampleMime: null, sampleName: null, updatedAt: new Date() })
    .where(eq(musicInstrumentSettings.voice, voice));
  return json({ ok: true });
}
