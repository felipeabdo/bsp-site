import { cache } from "react";
import { cookies } from "next/headers";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { memberColumns, type PublicMember } from "@/lib/members";

const COOKIE = "bsp_session";
const SESSION_DAYS = 30;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null) {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64);
  const original = Buffer.from(hash, "hex");
  return original.length === test.length && timingSafeEqual(original, test);
}

const sha = (v: string) => createHash("sha256").update(v).digest("hex");

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await db.insert(sessions).values({ id: sha(token), userId, expiresAt });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, sha(token)));
  jar.delete(COOKIE);
}

export type CurrentUser = PublicMember & {
  email: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  gender: string | null;
  bloodType: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  shirtSize: string | null;
  showContact: boolean;
  createdAt: Date;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({
      ...memberColumns,
      whatsapp: users.whatsapp,
      email: users.email,
      birthDate: users.birthDate,
      birthPlace: users.birthPlace,
      address: users.address,
      city: users.city,
      state: users.state,
      zip: users.zip,
      phone: users.phone,
      gender: users.gender,
      bloodType: users.bloodType,
      emergencyName: users.emergencyName,
      emergencyPhone: users.emergencyPhone,
      shirtSize: users.shirtSize,
      showContact: users.showContact,
      createdAt: users.createdAt,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, sha(token)))
    .limit(1);
  const row = rows[0];
  if (!row || row.expiresAt < new Date()) return null;
  const { expiresAt: _e, ...user } = row;
  void _e;
  return user;
});
