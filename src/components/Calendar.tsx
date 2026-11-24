import Link from "next/link";

type Ev = {
  id: number;
  title: string;
  startsAt: Date;
  timeLabel: string | null;
  location: string | null;
  description: string | null;
  kind: string;
  free: boolean;
  confirmed: boolean;
  isDemo: boolean;
};

const TZ = "America/Sao_Paulo";
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("pt-BR", { timeZone: TZ, ...o });
const parts = (d: Date) => {
  const [day, month, year] = d
    .toLocaleDateString("pt-BR", { timeZone: TZ, day: "numeric", month: "numeric", year: "numeric" })
    .split("/")
    .map(Number);
  return { day, month, year };
};

export function MiniCalendar({ events }: { events: Ev[] }) {
  const ref = events[0]?.startsAt ?? new Date();
  const { month, year } = parts(ref);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = first.getUTCDay();
  const total = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const marked = new Set(
    events
      .map((e) => parts(e.startsAt))
      .filter((p) => p.month === month && p.year === year)
      .map((p) => p.day),
  );
  const cells = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const monthName = first.toLocaleDateString("pt-BR", { month: "long", timeZone: "UTC" });

  return (
    <div className="rounded-[2rem] bg-lago p-6 text-creme sm:p-7">
      <div className="flex items-end justify-between">
        <h3 className="font-display text-3xl capitalize">{monthName}</h3>
        <span className="font-display text-xl text-sol">{year}</span>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase text-creme/60">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-sm">
        {cells.map((c, i) =>
          c === null ? (
            <span key={i} />
          ) : (
            <span
              key={i}
              className={`grid aspect-square place-items-center rounded-full font-semibold ${
                marked.has(c) ? "bg-sol text-creme shadow-[0_0_0_4px_rgba(249,131,78,0.25)]" : "text-creme/85"
              }`}
            >
              {c}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

export function EventList({ events, compact = false }: { events: Ev[]; compact?: boolean }) {
  if (!events.length)
    return <p className="rounded-3xl bg-areia p-6 text-center font-medium">Nenhum evento marcado por enquanto. Siga o Instagram!</p>;
  return (
    <ul className="space-y-3">
      {events.map((e) => (
        <li key={e.id} className="group flex gap-4 rounded-3xl bg-white p-3 pr-5 shadow-[0_4px_0_rgba(40,121,159,0.08)] ring-1 ring-tinta/5 transition hover:-translate-y-0.5">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-sol text-center text-creme">
            <div>
              <div className="font-display text-3xl leading-none">{fmt(e.startsAt, { day: "2-digit" })}</div>
              <div className="text-xs font-semibold uppercase tracking-wider">{fmt(e.startsAt, { month: "short" }).replace(".", "")}</div>
            </div>
          </div>
          <div className="min-w-0 flex-1 py-1">
            <h4 className="font-display text-xl leading-tight">{e.title}</h4>
            <p className="mt-1 text-sm text-tinta/70">
              {[e.timeLabel, e.location].filter(Boolean).join(" · ")}
            </p>
            {!compact && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="chip bg-lago-100 text-lago-700">{e.kind}</span>
                {e.free && <span className="chip bg-sol-100 text-sol-600">Gratuito</span>}
                {!e.confirmed && <span className="chip bg-areia text-tinta/70">A confirmar</span>}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PastEventList({ events }: { events: Ev[] }) {
  return (
    <ul className="divide-y divide-tinta/10">
      {events.map((e) => (
        <li key={e.id} className="flex items-baseline gap-4 py-3">
          <span className="w-20 shrink-0 text-sm font-semibold text-sol-600">{fmt(e.startsAt, { month: "short", year: "numeric" })}</span>
          <span className="font-medium">{e.title}</span>
        </li>
      ))}
    </ul>
  );
}

export function SeeAll({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-semibold text-lago underline-offset-4 hover:underline">
      {children} <span aria-hidden>→</span>
    </Link>
  );
}
