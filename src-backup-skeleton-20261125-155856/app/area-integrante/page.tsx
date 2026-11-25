import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { and, count, desc, eq, inArray, ne } from "drizzle-orm";
import MemberDashboard from "@/components/MemberDashboard";
import { db } from "@/db";
import { announcements, eventRsvps, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { listMembers, publishedUpcomingEvents } from "@/lib/members";
import { isMusicAdmin } from "@/lib/music-admin";
import { createMemberQrToken } from "@/lib/member-qr";
import { getSiteOrigin } from "@/lib/site-origin";

export const metadata: Metadata = { title: "Área do Integrante" };
export const dynamic = "force-dynamic";

export default async function AreaIntegrantePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  const isAdmin = isMusicAdmin(user);
  const memberQrValue = `${await getSiteOrigin()}/q/${createMemberQrToken(user.id, user.memberId)}`;
  const [events, noticeRows, members] = await Promise.all([
    publishedUpcomingEvents(12),
    db.select().from(announcements)
      .where(eq(announcements.published, true))
      .orderBy(desc(announcements.pinned), desc(announcements.createdAt))
      .limit(12),
    listMembers(),
  ]);

  const eventIds = events.map((event) => event.id);
  const rsvpRows = eventIds.length
    ? await db.select({ eventId: eventRsvps.eventId, status: eventRsvps.status })
      .from(eventRsvps)
      .where(and(eq(eventRsvps.memberId, user.memberId), inArray(eventRsvps.eventId, eventIds)))
    : [];

  const rsvpSummary = isAdmin && eventIds.length
    ? await db.select({
        eventId: eventRsvps.eventId,
        instrument: users.instrument,
        status: eventRsvps.status,
        total: count(),
      })
      .from(eventRsvps)
      .innerJoin(users, eq(users.memberId, eventRsvps.memberId))
      .where(and(inArray(eventRsvps.eventId, eventIds), eq(users.isDemo, false), ne(users.category, "ex")))
      .groupBy(eventRsvps.eventId, users.instrument, eventRsvps.status)
    : [];

  const activeMembers = members.filter((member) => !member.isDemo && member.category !== "ex");

  return (
    <section className="section-pad py-8 sm:py-12">
      <div className="container-bsp">
        <MemberDashboard
          user={user}
          events={events.map((event) => ({
            id: event.id,
            title: event.title,
            startsAt: event.startsAt.toISOString(),
            timeLabel: event.timeLabel,
            location: event.location,
            description: event.description,
            kind: event.kind,
            free: event.free,
            concentrationAt: event.concentrationAt,
            dressCode: event.dressCode,
          }))}
          initialRsvps={rsvpRows.map((rsvp) => ({
            eventId: rsvp.eventId,
            status: rsvp.status === "unavailable" ? "unavailable" : "going",
          }))}
          notices={noticeRows.map((notice) => ({
            id: notice.id,
            title: notice.title,
            body: notice.body,
            author: notice.author,
            pinned: notice.pinned,
            createdAt: notice.createdAt.toISOString(),
          }))}
          members={activeMembers}
          rsvpSummary={rsvpSummary.map((row) => ({
            eventId: row.eventId,
            instrument: row.instrument,
            status: row.status === "unavailable" ? "unavailable" : "going",
            total: Number(row.total),
          }))}
          isAdmin={isAdmin}
          memberQrValue={memberQrValue}
        />
      </div>
    </section>
  );
}
