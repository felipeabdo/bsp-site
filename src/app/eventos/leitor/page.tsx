import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { and, asc, eq, gte } from "drizzle-orm";
import EventQrScanner from "@/components/admin/EventQrScanner";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { isMusicAdmin } from "@/lib/music-admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leitor de carteirinhas" };

export default async function EventReaderPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (!isMusicAdmin(user)) redirect("/area-integrante");

  const eventsList = await db
    .select({ id: events.id, title: events.title, startsAt: events.startsAt, location: events.location })
    .from(events)
    .where(and(eq(events.confirmed, true), eq(events.isDemo, false), gte(events.startsAt, new Date(Date.now() - 7 * 86400_000))))
    .orderBy(asc(events.startsAt))
    .limit(100);

  return (
    <section className="section-pad py-10 sm:py-14">
      <div className="container-bsp mx-auto max-w-6xl">
        <EventQrScanner initialEvents={eventsList.map((event) => ({ ...event, startsAt: event.startsAt.toISOString() }))} />
      </div>
    </section>
  );
}
