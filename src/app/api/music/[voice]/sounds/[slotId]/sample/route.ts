import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { musicInstrumentSettings, musicSoundSamples } from "@/db/schema";
import { INSTRUMENTS, type Voice } from "@/lib/music";
import { getCurrentUser } from "@/lib/auth";
import { isMusicAdmin } from "@/lib/music-admin";
import { json } from "@/lib/api";

export const dynamic = "force-dynamic";
const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "audio/wav", "audio/wave", "audio/x-wav", "audio/mpeg", "audio/mp3",
  "audio/ogg", "audio/webm", "audio/mp4", "audio/aac", "audio/flac",
  "audio/x-flac", "audio/aiff", "audio/x-aiff", "audio/m4a", "audio/x-m4a",
]);
type Ctx = { params: Promise<{ voice: string; slotId: string }> };
async function resolve(ctx: Ctx) {
  const { voice, slotId } = await ctx.params;
  if (!INSTRUMENTS.some((item) => item.id === voice) || !/^sound-[1-9]$|^sound-10$/.test(slotId)) return null;
  return { voice: voice as Voice, slotId };
}
async function adminError() {
  const user = await getCurrentUser();
  return isMusicAdmin(user) ? null : json({ error: "Apenas administradores autorizados podem gerenciar gravações." }, user ? 403 : 401);
}
export async function GET(_req: Request, ctx: Ctx) {
  const target = await resolve(ctx);
  if (!target) return json({ error: "Som não encontrado." }, 404);
  const [row] = await db.select({ data: musicSoundSamples.sampleData, mime: musicSoundSamples.sampleMime, name: musicSoundSamples.sampleName })
    .from(musicSoundSamples).where(and(eq(musicSoundSamples.voice, target.voice), eq(musicSoundSamples.slotId, target.slotId))).limit(1);
  if (row) {
    const bytes = Buffer.from(row.data, "base64");
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": row.mime, "Content-Length": String(bytes.byteLength), "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  }
  // Compatibility: the old single upload remains available as the first sound of an instrument.
  if (target.slotId === "sound-1") {
    const [legacy] = await db.select({ data: musicInstrumentSettings.sampleData, mime: musicInstrumentSettings.sampleMime })
      .from(musicInstrumentSettings).where(eq(musicInstrumentSettings.voice, target.voice)).limit(1);
    if (legacy?.data) {
      const bytes = Buffer.from(legacy.data, "base64");
      return new Response(new Uint8Array(bytes), { headers: { "Content-Type": legacy.mime ?? "audio/wav", "Content-Length": String(bytes.byteLength), "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
    }
  }
  return json({ error: "Este tipo de som ainda não tem gravação." }, 404);
}
export async function POST(req: Request, ctx: Ctx) {
  const denied = await adminError();
  if (denied) return denied;
  const target = await resolve(ctx);
  if (!target) return json({ error: "Som não encontrado." }, 404);
  let form: FormData;
  try { form = await req.formData(); } catch { return json({ error: "Envie um arquivo de áudio válido." }, 400); }
  const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "Selecione um arquivo de áudio." }, 400);
  if (file.size < 1 || file.size > MAX_AUDIO_BYTES) return json({ error: "O áudio deve ter até 5 MB." }, 400);
  if (!ALLOWED_MIME.has(file.type)) return json({ error: "Formato não suportado. Use WAV, MP3, OGG, WebM, M4A/AAC, FLAC ou AIFF." }, 400);
  const sampleData = Buffer.from(await file.arrayBuffer()).toString("base64");
  await db.insert(musicSoundSamples).values({ voice: target.voice, slotId: target.slotId, sampleData, sampleMime: file.type, sampleName: file.name.slice(0, 180) })
    .onConflictDoUpdate({ target: [musicSoundSamples.voice, musicSoundSamples.slotId], set: { sampleData, sampleMime: file.type, sampleName: file.name.slice(0, 180), updatedAt: new Date() } });
  if (target.slotId === "sound-1") await db.update(musicInstrumentSettings)
    .set({ sampleData: null, sampleMime: null, sampleName: null, updatedAt: new Date() })
    .where(eq(musicInstrumentSettings.voice, target.voice));
  return json({ ok: true, name: file.name });
}
export async function DELETE(_req: Request, ctx: Ctx) {
  const denied = await adminError();
  if (denied) return denied;
  const target = await resolve(ctx);
  if (!target) return json({ error: "Som não encontrado." }, 404);
  await db.delete(musicSoundSamples).where(and(eq(musicSoundSamples.voice, target.voice), eq(musicSoundSamples.slotId, target.slotId)));
  if (target.slotId === "sound-1") await db.update(musicInstrumentSettings)
    .set({ sampleData: null, sampleMime: null, sampleName: null, updatedAt: new Date() })
    .where(eq(musicInstrumentSettings.voice, target.voice));
  return json({ ok: true });
}
