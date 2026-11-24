"use client";

import { useMemo, useState } from "react";

type HomeCalendarProps = {
  /** Data local de Brasília, no formato YYYY-MM-DD, enviada pela página. */
  today: string;
};

type DemoEvent = {
  id: string;
  date: string;
  time: string;
  title: string;
  kind: string;
  location: string;
  description: string;
};

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

// Agenda inteiramente fictícia para demonstrar a navegação do calendário.
// Em datas com mais de dois horários, a home exibe apenas os dois últimos.
const DEMO_SCHEDULE = [
  { day: 2, time: "10:00", title: "Ensaio de bateria", kind: "Ensaio", location: "Sede do bloco · Brasília", description: "Afinação dos surdos e repasse do repertório." },
  { day: 2, time: "18:30", title: "Roda de samba-reggae", kind: "Encontro", location: "Espaço cultural · Brasília", description: "Encontro musical aberto para percussionistas." },
  { day: 4, time: "09:30", title: "Oficina de percussão", kind: "Oficina", location: "Espaço BSP · Brasília", description: "Uma manhã dedicada aos fundamentos dos tambores." },
  { day: 6, time: "16:00", title: "Ensaio de rua", kind: "Ensaio", location: "Parque da Cidade · Brasília", description: "Simulação de cortejo e dinâmica de bateria." },
  { day: 8, time: "11:00", title: "Vivência de ritmos", kind: "Oficina", location: "Espaço BSP · Brasília", description: "Experimentação de levadas e instrumentos." },
  { day: 8, time: "17:00", title: "Ensaio geral", kind: "Ensaio", location: "Sede do bloco · Brasília", description: "Ensaio coletivo com todas as alas." },
  { day: 10, time: "19:00", title: "Encontro da bateria", kind: "Encontro", location: "Sede do bloco · Brasília", description: "Repertório, arranjos e integração do grupo." },
  { day: 12, time: "10:00", title: "Oficina aberta", kind: "Oficina", location: "Espaço BSP · Brasília", description: "Atividade demonstrativa de iniciação à percussão." },
  { day: 14, time: "15:30", title: "Cortejo de demonstração", kind: "Cortejo", location: "Eixão do Lazer · Brasília", description: "Apresentação fictícia ao ar livre." },
  { day: 16, time: "18:00", title: "Ensaio de repertório", kind: "Ensaio", location: "Sede do bloco · Brasília", description: "Preparação de novas músicas para a rua." },
  { day: 18, time: "20:00", title: "Noite de ritmos", kind: "Show", location: "Praça cultural · Brasília", description: "Apresentação demonstrativa de samba-reggae e axé." },
  { day: 20, time: "09:00", title: "Aula de fundamentos", kind: "Oficina", location: "Espaço BSP · Brasília", description: "Prática de base, condução e convenções." },
  { day: 21, time: "16:30", title: "Ensaio aberto", kind: "Ensaio", location: "Parque da Cidade · Brasília", description: "Ensaio fictício acompanhado de perto pelo público." },
  { day: 23, time: "09:00", title: "Passagem de repertório", kind: "Ensaio", location: "Sede do bloco · Brasília", description: "Primeiro encontro demonstrativo do dia." },
  { day: 23, time: "14:00", title: "Oficina de timbal e repinique", kind: "Oficina", location: "Espaço BSP · Brasília", description: "Atividade prática para explorar diferentes timbres." },
  { day: 23, time: "19:30", title: "Roda musical do BSP", kind: "Encontro", location: "Praça cultural · Brasília", description: "Fechamento do dia com música e convivência." },
  { day: 24, time: "18:30", title: "Ensaio de naipe", kind: "Ensaio", location: "Sede do bloco · Brasília", description: "Ensaio por instrumentos e alinhamento de viradas." },
  { day: 26, time: "10:00", title: "Oficina de caixa", kind: "Oficina", location: "Espaço BSP · Brasília", description: "Exercícios de técnica e precisão rítmica." },
  { day: 28, time: "15:00", title: "Cortejo experimental", kind: "Cortejo", location: "Orla do Lago · Brasília", description: "Percurso demonstrativo com a bateria completa." },
  { day: 28, time: "19:00", title: "Encontro de encerramento", kind: "Encontro", location: "Sede do bloco · Brasília", description: "Confraternização fictícia depois do cortejo." },
  { day: 30, time: "18:00", title: "Ensaio de fechamento do mês", kind: "Ensaio", location: "Sede do bloco · Brasília", description: "Último encontro demonstrativo do calendário." },
];

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function dateLabel(key: string, options: Intl.DateTimeFormatOptions) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString("pt-BR", {
    ...options,
    timeZone: "UTC",
  });
}

function makeMonthEvents(year: number, month: number): DemoEvent[] {
  const totalDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return DEMO_SCHEDULE.filter((event) => event.day <= totalDays).map((event, index) => ({
    ...event,
    id: `${year}-${month}-${event.day}-${event.time}-${index}`,
    date: dateKey(year, month, event.day),
  }));
}

export default function HomeCalendar({ today }: HomeCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const [year, month] = today.split("-").map(Number);
    return { year, month };
  });
  const [selectedDate, setSelectedDate] = useState(today);

  const monthEvents = useMemo(
    () => makeMonthEvents(visibleMonth.year, visibleMonth.month),
    [visibleMonth],
  );

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, DemoEvent[]>();
    for (const event of monthEvents) {
      const current = grouped.get(event.date) ?? [];
      current.push(event);
      grouped.set(event.date, current);
    }
    return grouped;
  }, [monthEvents]);

  const selectedEvents = [...(eventsByDate.get(selectedDate) ?? [])]
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(-2);

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
    setSelectedDate(dateKey(year, month, 1));
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
            <p className="home-calendar__month-hint">Selecione uma data para consultar os eventos</p>
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
            const key = dateKey(visibleMonth.year, visibleMonth.month, day);
            const count = eventsByDate.get(key)?.length ?? 0;
            const isSelected = key === selectedDate;
            const isToday = key === today;
            return (
              <button
                key={key}
                type="button"
                className={[
                  "home-calendar__day",
                  count ? "has-events" : "",
                  isSelected ? "is-selected" : "",
                  isToday ? "is-today" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => setSelectedDate(key)}
                aria-label={`${day} de ${monthTitle}${count ? `, ${count} eventos` : ", sem eventos demonstrativos"}`}
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
            {selectedEvents.map((event) => {
              const status = selectedDate < today ? "Já aconteceu" : selectedDate === today ? "Hoje" : "Vem aí";
              return (
                <article className="home-calendar-event" key={event.id}>
                  <div className="home-calendar-event__time">{event.time}</div>
                  <div className="home-calendar-event__body">
                    <p className="home-calendar-event__status">{status} <span>·</span> {event.kind}</p>
                    <h4>{event.title}</h4>
                    <p className="home-calendar-event__location">{event.location}</p>
                    <p className="home-calendar-event__description">{event.description}</p>
                  </div>
                </article>
              );
            })}
            <p className="home-calendar__limit-note">Exibindo até os dois últimos horários desta data.</p>
          </div>
        ) : (
          <div className="home-calendar__empty-state">
            <span aria-hidden="true">♪</span>
            <p>Não há evento demonstrativo cadastrado para esta data.</p>
            <small>Escolha outro dia do mês para consultar a programação fictícia.</small>
          </div>
        )}
        <p className="home-calendar__disclaimer">Agenda demonstrativa: todos os eventos exibidos são fictícios.</p>
      </section>
    </div>
  );
}
