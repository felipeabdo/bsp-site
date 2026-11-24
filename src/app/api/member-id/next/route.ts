import { json } from "@/lib/api";
import { formatMemberId, nextSequence } from "@/lib/members";

export async function GET(req: Request) {
  const year = Number(new URL(req.url).searchParams.get("year"));
  if (!Number.isInteger(year) || year < 2013 || year > new Date().getFullYear()) return json({ error: "Ano inválido" }, 400);
  const seq = await nextSequence(year);
  return json({ memberId: formatMemberId(year, seq) });
}
