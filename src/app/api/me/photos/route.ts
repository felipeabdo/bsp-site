import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { json, readBody } from "@/lib/api";

const MAX_CHARS = 2_200_000; // ~1.6 MB em base64

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return json({ error: "Faça login para continuar." }, 401);
  const b = await readBody(req);
  const kind = b.kind === "portrait" ? "portrait" : b.kind === "body" ? "body" : null;
  const dataUrl = typeof b.dataUrl === "string" ? b.dataUrl : "";
  if (!kind) return json({ error: "Tipo de foto inválido." }, 400);
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(dataUrl) || dataUrl.length > MAX_CHARS)
    return json({ error: "Imagem inválida ou grande demais." }, 400);

  const set: Partial<typeof users.$inferInsert> = { photoVersion: sql`${users.photoVersion} + 1` as unknown as number };
  if (kind === "body") {
    set.photoBody = dataUrl;
    set.bodyPhotoType = b.bodyPhotoType === "half" ? "half" : "full";
  } else {
    set.photoPortrait = dataUrl;
  }
  await db.update(users).set(set).where(eq(users.id, me.id));
  return json({ ok: true });
}

export async function DELETE(req: Request) {
  const me = await getCurrentUser();
  if (!me) return json({ error: "Faça login para continuar." }, 401);
  const kind = new URL(req.url).searchParams.get("kind");
  if (kind !== "body" && kind !== "portrait") return json({ error: "Tipo de foto inválido." }, 400);
  await db
    .update(users)
    .set({
      ...(kind === "body" ? { photoBody: null } : { photoPortrait: null }),
      photoVersion: sql`${users.photoVersion} + 1` as unknown as number,
    })
    .where(eq(users.id, me.id));
  return json({ ok: true });
}
