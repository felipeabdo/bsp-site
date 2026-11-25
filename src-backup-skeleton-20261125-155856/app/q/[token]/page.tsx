import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyMemberQrToken } from "@/lib/member-qr";

export const dynamic = "force-dynamic";

export default async function MemberQrLanding({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const separator = token.indexOf("-");
  if (separator < 1) notFound();
  const userId = Number(token.slice(0, separator));
  if (!Number.isSafeInteger(userId) || userId < 1) notFound();

  const [member] = await db.select({ id: users.id, memberId: users.memberId, isDemo: users.isDemo }).from(users).where(eq(users.id, userId)).limit(1);
  if (!member || member.isDemo || !verifyMemberQrToken(token, member.id, member.memberId)) notFound();
  redirect(`/verificar/${encodeURIComponent(member.memberId)}`);
}
