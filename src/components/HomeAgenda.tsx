import HomeCalendar from "@/components/HomeCalendar";
import { publishedUpcomingEvents } from "@/lib/members";

type HomeAgendaProps = { today: string };

/**
 * Loads the public event list independently from the Home hero. Keeping this
 * async work below a Suspense boundary lets Next.js stream the hero and its LCP
 * image without waiting for a cache miss or PostgreSQL query for the agenda.
 */
export default async function HomeAgenda({ today }: HomeAgendaProps) {
  const upcoming = await publishedUpcomingEvents(12);
  const events = upcoming.map((event) => ({
    id: event.id,
    title: event.title,
    startsAt: event.startsAt.toISOString(),
    timeLabel: event.timeLabel,
    location: event.location,
    description: event.description,
    kind: event.kind,
    free: event.free,
  }));

  return <HomeCalendar today={today} events={events} />;
}

/** Stable visual placeholder prevents the agenda area from collapsing while the
 * cached event query resolves. It reuses the calendar's existing visual panels.
 */
export function HomeCalendarSkeleton() {
  return (
    <div className="home-calendar" aria-hidden="true">
      <div className="home-calendar__month-panel min-h-[23rem]">
        <div className="h-8 w-36 rounded-lg bg-creme/20" />
        <div className="mt-3 h-3 w-52 max-w-full rounded bg-creme/15" />
        <div className="mt-8 grid grid-cols-7 gap-3">
          {Array.from({ length: 35 }, (_, index) => (
            <span key={index} className="aspect-square rounded-full bg-creme/15" />
          ))}
        </div>
      </div>
      <div className="home-calendar__details min-h-[18rem]">
        <div className="h-3 w-32 rounded bg-lago/10" />
        <div className="mt-4 h-8 w-56 max-w-full rounded-lg bg-lago/10" />
        <div className="mt-3 h-3 w-28 rounded bg-lago/10" />
        <div className="mt-8 h-20 rounded-2xl bg-lago/5" />
      </div>
    </div>
  );
}
