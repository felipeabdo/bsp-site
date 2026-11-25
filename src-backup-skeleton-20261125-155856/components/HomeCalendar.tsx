"use client";

import { useMemo, useState } from "react";

type CalendarEvent = {
  id: number;
  title: string;
  startsAt: string;
  timeLabel: string | null;
  location: string | null;
  description: string | null;
  kind: string;
  free: boolean;
};

type HomeCalendarProps = {
  today: string;
  events: CalendarEvent[];
};

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const TZ = "America/Sao_Paulo";

function dateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function dateLabel(key: string, options: Intl.DateTimeFormatOptions) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString("pt-BR", {
    ...options,
    timeZone: "UTC",
  });
}

function eventBadge(event: CalendarEvent) {
  if (event.kind === "cortejo" && event.free) return "Cortejo Gratuito";
  if (!event.free) return "Evento Pago";
  if (event.kind === "ensaio") return "Ensaio Aberto";
  if (event.kind === "oficina") return "Oficina";
  return "Evento Gratuito";
}

export default function HomeCalendar({ today, events }: HomeCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const [year, month] = today.split("-").map(Number);
    return { year, month };
  });
  const [selectedDate, setSelectedDate] = useState(today);

  const eventsWithDate = useMemo(
    () => events.map((event) => ({ ...event, date: dateKey(new Date(event.startsAt)) })),
    [events],
  );

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, (CalendarEvent & { date: string })[]>();
    for (const event of eventsWithDate) {
      const current = grouped.get(event.date) ?? [];
      current.push(event);
      grouped.set(event.date, current);
    }
    return grouped;
  }, [eventsWithDate]);

  const selectedEvents = (eventsByDate.get(selectedDate) ?? []).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const firstWeekday = new Date(Date.UTC(visibleMonth.year, visibleMonth.month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(visibleMonth.year, visibleMonth.month, 0)).getUTCDate();
  const calendarCells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const monthTitle = new Date(Date.UTC(visibleMonth.year, visibleMonth.month - 1, 1)).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  function changeMonth(direction: number) {
    const next = new Date(Date.UTC(visibleMonth.year, visibleMonth.month - 1 + direction, 1));
    const year = next.getUTCFullYear();
    const month = next.getUTCMonth() + 1;
    setVisibleMonth({ year, month });
    setSelectedDate(dateKey(new Date(Date.UTC(year, month - 1, 1, 12))));
  }

  const selectedDateStatus = selectedDate === today
    ? "Hoje"
    : selectedDate < today
      ? "Este dia já passou"
      : "Data futura";

  return (
    <div className="home-calendar">
      <section className="home-calendar__month-panel" aria-label="Calendário mensal interativo">
        <div className="home-calendar__month-header">
          <div>
            <h3 className="home-calendar__month-title">{monthTitle}</h3>
            <p className="home-calendar__month-hint">Selecione uma data para consultar a programação publicada</p>
          </div>
          <div className="home-calendar__navigation">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Mês anterior">‹</button>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Próximo mês">›</button>
          </div>
        </div>

        <div className="home-calendar__weekdays" aria-hidden="true">
          {WEEKDAYS.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
        </div>

        <div className="home-calendar__days">
          {calendarCells.map((day, index) => {
            if (day === null) return <span className="home-calendar__empty" key={`empty-${index}`} />;
            const key = `${visibleMonth.year}-${String(visibleMonth.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const count = eventsByDate.get(key)?.length ?? 0;
            const isSelected = key === selectedDate;
            const isToday = key === today;
            return (
              <button
                key={key}
                type="button"
                className={["home-calendar__day", count ? "has-events" : "", isSelected ? "is-selected" : "", isToday ? "is-today" : ""].filter(Boolean).join(" ")}
                onClick={() => setSelectedDate(key)}
                aria-label={`${day} de ${monthTitle}${count ? `, ${count} eventos` : ", sem eventos publicados"}`}
                aria-pressed={isSelected}
              >
                <span>{day}</span>
                {count > 0 && <i aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <div className="home-calendar__legend">
          <span><i className="home-calendar__legend-dot home-calendar__legend-dot--event" /> Dias com eventos</span>
          <span><i className="home-calendar__legend-dot home-calendar__legend-dot--today" /> Hoje</span>
        </div>
      </section>

      <section className="home-calendar__details" aria-live="polite" aria-label="Eventos da data selecionada">
        <div className="home-calendar__details-heading">
          <p className="home-calendar__details-overline">Programação do dia</p>
          <h3>{dateLabel(selectedDate, { weekday: "long", day: "numeric", month: "long" })}</h3>
          <p className="home-calendar__details-status">{selectedDateStatus}</p>
        </div>

        {selectedEvents.length > 0 ? (
          <div className="home-calendar__event-list">
            {selectedEvents.map((event) => (
              <article className="home-calendar-event" key={event.id}>
                <div className="home-calendar-event__time">
                  <strong>{event.timeLabel || new Date(event.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ })}</strong>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`home-calendar-event__badge ${!event.free ? "is-paid" : event.kind === "ensaio" ? "is-rehearsal" : ""}`}>{eventBadge(event)}</span>
                  </div>
                  <h4 className="home-calendar-event__title">{event.title}</h4>
                  {event.location && <p className="home-calendar-event__location">{event.location}</p>}
                  {event.description && <p className="home-calendar-event__description">{event.description}</p>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="home-calendar__empty-state">
            <span aria-hidden="true">♫</span>
            <p>{events.length ? "Nenhum compromisso publicado para esta data." : "A próxima programação será anunciada por aqui. A agenda é atualizada pela equipe do bloco."}</p>
          </div>
        )}
        <a href="/galeria#agenda" className="home-calendar__more">Ver agenda completa <span aria-hidden="true">→</span></a>
      </section>
    </div>
  );
}
