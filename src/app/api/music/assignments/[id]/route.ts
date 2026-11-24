import { eq } from "drizzle-orm";
import { db } from "@/db";
import { musicAssignments } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { isMusicAdmin } from "@/lib/music-admin";
import { json } from "@/lib/api";

export const dynamic = "force-dynamic";
export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!isMusicAdmin(user)) return json({ error: "Apenas administradores autorizados podem remover estudos." }, user ? 403 : 401);
  const { id } = await context.params;
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId < 1) return json({ error: "Estudo não encontrado." }, 404);
  await db.delete(musicAssignments).where(eq(musicAssignments.id, numericId));
  return json({ ok: true });
}
