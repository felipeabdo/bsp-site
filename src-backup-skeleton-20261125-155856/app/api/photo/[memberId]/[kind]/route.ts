import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function GET(_req: Request, ctx: { params: Promise<{ memberId: string; kind: string }> }) {
  const { memberId, kind } = await ctx.params;
  if (kind !== "body" && kind !== "portrait") return new Response("Not found", { status: 404 });
  const [row] = await db
    .select({ photo: kind === "body" ? users.photoBody : users.photoPortrait })
    .from(users)
    .where(eq(users.memberId, memberId))
    .limit(1);
  const match = row?.photo?.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!match) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(match[2], "base64"), {
    headers: {
      "Content-Type": match[1],
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
