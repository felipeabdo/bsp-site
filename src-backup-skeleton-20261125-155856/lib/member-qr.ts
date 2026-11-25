import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * QR não carrega informações pessoais: ele contém apenas um identificador
 * numérico e uma assinatura HMAC. A consulta dos dados fica protegida no
 * endpoint de leitura, exclusivo da administração.
 */
function signingKey(): string {
  const key = process.env.BSP_QR_SECRET || process.env.DATABASE_URL;
  if (!key) throw new Error("Configure BSP_QR_SECRET para assinar os QR Codes dos integrantes.");
  return key;
}

function signature(userId: number, memberId: string): string {
  return createHmac("sha256", signingKey())
    .update(`bsp-member-card:v1:${userId}:${memberId}`)
    .digest("hex")
    .slice(0, 32); // 128 bits de assinatura
}

export function createMemberQrToken(userId: number, memberId: string): string {
  return `${userId}-${signature(userId, memberId)}`;
}

export function parseMemberQrToken(value: string): { userId: number; token: string } | null {
  const raw = value.trim();
  let candidate = raw;
  try {
    const url = new URL(raw);
    candidate = url.pathname;
  } catch {
    // Também aceita o token isolado, para leitores USB ou entrada manual.
  }
  const match = candidate.match(/(?:^|\/)q\/([1-9]\d{0,9}-[a-f0-9]{32})\/?$/i) ||
    candidate.match(/^([1-9]\d{0,9}-[a-f0-9]{32})$/i);
  if (!match) return null;
  const token = match[1].toLowerCase();
  const userId = Number(token.slice(0, token.indexOf("-")));
  return Number.isSafeInteger(userId) && userId > 0 ? { userId, token } : null;
}

export function verifyMemberQrToken(token: string, userId: number, memberId: string): boolean {
  const expected = createMemberQrToken(userId, memberId);
  const actualBytes = Buffer.from(token.toLowerCase());
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}
