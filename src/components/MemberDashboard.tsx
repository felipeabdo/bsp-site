"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IDCardFront } from "@/components/IDCard";
import PrivateAssignments from "@/components/PrivateAssignments";
import MemberDirectory from "@/components/MemberDirectory";
import { displayName, fullName } from "@/lib/member-utils";
import type { PublicMember } from "@/lib/members";

type MemberProfile = PublicMember & {
  firstName: string;
  lastName: string;
  joinYear: number;
  category: string;
  email: string | null;
};

type EventItem = {
  id: number;
  title: string;
  startsAt: string;
  timeLabel: string | null;
  location: string | null;
  description: string | null;
  kind: string;
  free: boolean;
  concentrationAt: string | null;
  dressCode: string | null;
};

type Notice = {
  id: number;
  title: string;
  body: string;
  author: string;
  pinned: boolean;
  createdAt: string;
};

type RSVP = { eventId: number; status: "going" | "unavailable" };
type RSVPCount = { eventId: number; instrument: string | null; status: "going" | "unavailable"; total: number };

function eventType(event: EventItem) {
  if (event.kind === "cortejo" && event.free) return "Cortejo Gratuito";
  if (!event.free) return "Evento Pago";
  if (event.kind === "ensaio") return "Ensaio";
  if (event.kind === "oficina") return "Oficina";
  return "Show / Evento";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "America/Sao_Paulo",
  });
}

function formatTime(event: EventItem) {
  return event.timeLabel || new Date(event.startsAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export default function MemberDashboard({
  user,
  events,
  initialRsvps,
  notices,
  members,
  rsvpSummary,
  isAdmin,
  memberQrValue,
}: {
  user: MemberProfile;
  events: EventItem[];
  initialRsvps: RSVP[];
  notices: Notice[];
  members: PublicMember[];
  rsvpSummary: RSVPCount[];
  isAdmin: boolean;
  memberQrValue: string;
}) {
  const router = useRouter();
  const [rsvps, setRsvps] = useState<Record<number, RSVP["status"]>>(
    Object.fromEntries(initialRsvps.map((rsvp) => [rsvp.eventId, rsvp.status])),
  );
  const [savingEvent, setSavingEvent] = useState<number | null>(null);
  const [rsvpError, setRsvpError] = useState("");
  const [noticeState, setNoticeState] = useState("");
  const [noticeError, setNoticeError] = useState("");
  const [savingNotice, setSavingNotice] = useState(false);
  const [eventCreateState, setEventCreateState] = useState("");
  const [eventCreateError, setEventCreateError] = useState("");
  const [savingNewEvent, setSavingNewEvent] = useState(false);

  async function confirmPresence(eventId: number, status: RSVP["status"]) {
    setSavingEvent(eventId);
    setRsvpError("");
    try {
      const response = await fetch("/api/events/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar sua resposta.");
      setRsvps((current) => ({ ...current, [eventId]: status }));
    } catch (error) {
      setRsvpError(error instanceof Error ? error.message : "Não foi possível salvar sua resposta.");
    } finally {
      setSavingEvent(null);
    }
  }

  async function publishEvent(form: HTMLFormElement) {
    setSavingNewEvent(true);
    setEventCreateError("");
    setEventCreateState("");
    const data = new FormData(form);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.get("title"),
          startsAt: data.get("startsAt"),
          timeLabel: data.get("timeLabel"),
          location: data.get("location"),
          description: data.get("description"),
          kind: data.get("kind"),
          free: data.get("free") === "on",
          concentrationAt: data.get("concentrationAt"),
          dressCode: data.get("dressCode"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível publicar o compromisso.");
      form.reset();
      setEventCreateState("Compromisso publicado na agenda.");
      router.refresh();
    } catch (error) {
      setEventCreateError(error instanceof Error ? error.message : "Não foi possível publicar o compromisso.");
    } finally {
      setSavingNewEvent(false);
    }
  }

  async function publishNotice(form: HTMLFormElement) {
    setSavingNotice(true);
    setNoticeError("");
    setNoticeState("");
    const data = new FormData(form);
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.get("title"),
          body: data.get("body"),
          pinned: data.get("pinned") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível publicar o aviso.");
      form.reset();
      setNoticeState("Comunicado publicado.");
      router.refresh();
    } catch (error) {
      setNoticeError(error instanceof Error ? error.message : "Não foi possível publicar o aviso.");
    } finally {
      setSavingNotice(false);
    }
  }

  const currentStatus = user.category === "ex" ? "Ex-integrante" : "Ativo";

  return (
    <div className="space-y-10">
      {/* Carteirinha digital e identidade */}
      <section className="grid items-center gap-7 rounded-[2.25rem] bg-lago p-5 text-creme sm:p-8 lg:grid-cols-[1.05fr_0.95fr]" aria-labelledby="member-dashboard-title">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-sol">Área do integrante</p>
          <h1 id="member-dashboard-title" className="font-display mt-3 text-4xl leading-tight sm:text-5xl">Bom ter você na roda, {displayName(user).split(" ")[0]}!</h1>
          <p className="mt-3 max-w-xl text-creme/80">Este é seu ponto de encontro com a agenda, os avisos da diretoria, os estudos e a comunidade do Santo Pecado.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/configuracoes?aba=perfil" className="btn btn-creme">Atualizar meu perfil</Link>
            <Link href="/configuracoes?aba=carteirinha" className="btn btn-sol">Ver carteirinha completa</Link>
            {isAdmin && <Link href="/eventos/leitor" className="btn btn-creme">Leitor de eventos</Link>}
            {(!user.hasPortrait || !user.hasBody) && <Link href="/configuracoes?aba=fotos" className="btn btn-creme">Completar minhas fotos</Link>}
          </div>
        </div>
        <div className="min-w-0 rounded-[1.5rem] bg-creme/10 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-black uppercase tracking-widest text-creme/75">Sua carteirinha digital</p>
            <span className="rounded-full bg-sol px-3 py-1 text-xs font-extrabold text-creme">{currentStatus}</span>
          </div>
          <IDCardFront m={user} qrValue={memberQrValue} />
          <dl className="mt-4 grid grid-cols-2 gap-3 px-1 text-sm">
            <div><dt className="text-creme/60">Nome completo</dt><dd className="font-extrabold">{fullName(user)}</dd></div>
            <div><dt className="text-creme/60">ID único</dt><dd className="font-display text-xl">{user.memberId}</dd></div>
            <div><dt className="text-creme/60">Naipe principal</dt><dd className="font-extrabold">{user.instrument || "A definir"}</dd></div>
            <div><dt className="text-creme/60">Ano de entrada</dt><dd className="font-extrabold">{user.joinYear}</dd></div>
          </dl>
        </div>
      </section>

      {/* Mural */}
      <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-tinta/10 sm:p-8" aria-labelledby="notice-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sol-600">Fique ligado</p>
            <h2 id="notice-title" className="font-display mt-2 text-3xl text-lago sm:text-4xl">Mural do Mestre & Diretoria</h2>
          </div>
          <span className="rounded-full bg-sol/10 px-3 py-1.5 text-xs font-extrabold text-sol-600">Comunicados oficiais</span>
        </div>
        {notices.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {notices.map((notice) => (
              <article key={notice.id} className={`rounded-2xl p-5 ${notice.pinned ? "bg-lago text-creme" : "bg-areia text-tinta"}`}>
                <div className="flex flex-wrap items-center gap-2">
                  {notice.pinned && <span className="rounded-full bg-sol px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-creme">Fixado</span>}
                  <span className="text-xs font-bold opacity-65">{new Date(notice.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span>
                </div>
                <h3 className="font-display mt-3 text-2xl">{notice.title}</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed opacity-85">{notice.body}</p>
                <p className="mt-4 text-xs font-extrabold opacity-65">{notice.author}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-areia p-5 text-sm font-semibold text-tinta/65">Nenhum comunicado publicado no momento. Quando o Mestre ou a Diretoria fixarem um aviso, ele aparecerá aqui.</div>
        )}

        {isAdmin && (
          <form className="mt-6 rounded-2xl border border-lago/15 bg-creme p-5" onSubmit={(event) => { event.preventDefault(); void publishNotice(event.currentTarget); }}>
            <h3 className="font-display text-2xl text-lago">Publicar comunicado</h3>
            <div className="mt-4 grid gap-3">
              <label className="block"><span className="field-label">Título do aviso</span><input name="title" required minLength={4} maxLength={120} className="input" placeholder="Ex.: Mudança no horário do ensaio" /></label>
              <label className="block"><span className="field-label">Mensagem</span><textarea name="body" required minLength={8} maxLength={2500} rows={4} className="input" placeholder="Escreva as orientações para os integrantes." /></label>
              <label className="flex items-center gap-2 text-sm font-bold text-tinta"><input type="checkbox" name="pinned" className="h-4 w-4 accent-[#F9834E]" /> Fixar no topo do mural</label>
              {noticeError && <p role="alert" className="rounded-xl bg-sol/10 p-3 text-sm font-bold text-sol-600">{noticeError}</p>}
              {noticeState && <p role="status" className="rounded-xl bg-lago/10 p-3 text-sm font-bold text-lago">{noticeState}</p>}
              <button className="btn btn-sol justify-self-start" disabled={savingNotice}>{savingNotice ? "Publicando…" : "Publicar aviso"}</button>
            </div>
          </form>
        )}
      </section>

      {/* Compromissos e RSVP */}
      <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-tinta/10 sm:p-8" aria-labelledby="commitments-title">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-sol-600">Organize sua presença</p>
          <h2 id="commitments-title" className="font-display mt-2 text-3xl text-lago sm:text-4xl">Próximos compromissos</h2>
          <p className="mt-2 max-w-2xl text-sm text-tinta/65">Confirme sua presença para ajudar Mestre e Diretoria a organizar cada naipe.</p>
        </div>
        {isAdmin && (
          <details className="mt-5 rounded-2xl border border-lago/15 bg-creme p-5">
            <summary className="cursor-pointer font-extrabold text-lago">Cadastrar compromisso na agenda</summary>
            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void publishEvent(event.currentTarget); }}>
              <label className="block sm:col-span-2"><span className="field-label">Nome do compromisso</span><input name="title" required minLength={4} maxLength={140} className="input" placeholder="Ex.: Ensaio geral do bloco" /></label>
              <label className="block"><span className="field-label">Data e horário</span><input name="startsAt" type="datetime-local" required className="input" /></label>
              <label className="block"><span className="field-label">Texto do horário (opcional)</span><input name="timeLabel" maxLength={80} className="input" placeholder="Ex.: concentração às 15h" /></label>
              <label className="block sm:col-span-2"><span className="field-label">Local</span><input name="location" maxLength={180} className="input" placeholder="Endereço ou ponto de encontro" /></label>
              <label className="block"><span className="field-label">Tipo</span><select name="kind" className="input" defaultValue="ensaio"><option value="ensaio">Ensaio</option><option value="cortejo">Cortejo</option><option value="show">Show / evento</option><option value="oficina">Oficina</option></select></label>
              <label className="flex items-center gap-2 self-end pb-3 text-sm font-bold text-tinta"><input type="checkbox" name="free" defaultChecked className="h-4 w-4 accent-[#F9834E]" /> Evento gratuito</label>
              <label className="block"><span className="field-label">Horário de concentração</span><input name="concentrationAt" maxLength={100} className="input" placeholder="Ex.: 14h30" /></label>
              <label className="block"><span className="field-label">Figurino / uniforme</span><input name="dressCode" maxLength={180} className="input" placeholder="Ex.: camiseta do bloco e tênis" /></label>
              <label className="block sm:col-span-2"><span className="field-label">Orientações adicionais</span><textarea name="description" rows={3} maxLength={1600} className="input" placeholder="Informações para os integrantes e para o público." /></label>
              {eventCreateError && <p role="alert" className="rounded-xl bg-sol/10 p-3 text-sm font-bold text-sol-600 sm:col-span-2">{eventCreateError}</p>}
              {eventCreateState && <p role="status" className="rounded-xl bg-lago/10 p-3 text-sm font-bold text-lago sm:col-span-2">{eventCreateState}</p>}
              <button className="btn btn-sol justify-self-start sm:col-span-2" disabled={savingNewEvent}>{savingNewEvent ? "Publicando…" : "Publicar compromisso"}</button>
            </form>
            <p className="mt-3 text-xs text-tinta/55">Compromissos cadastrados aqui entram na agenda pública e no painel dos integrantes.</p>
          </details>
        )}
        {rsvpError && <p role="alert" className="mt-4 rounded-xl bg-sol/10 p-3 text-sm font-bold text-sol-600">{rsvpError}</p>}
        {events.length ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {events.map((event) => {
              const status = rsvps[event.id];
              const busy = savingEvent === event.id;
              return (
                <article key={event.id} className="rounded-2xl border border-lago/10 bg-areia/60 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-lago px-3 py-1 text-xs font-extrabold text-creme">{eventType(event)}</span>
                    <time className="text-xs font-extrabold text-sol-600">{formatDate(event.startsAt)}</time>
                  </div>
                  <h3 className="font-display mt-3 text-2xl text-lago">{event.title}</h3>
                  <p className="mt-1 text-sm font-extrabold text-tinta">{formatTime(event)}</p>
                  {event.description && <p className="mt-2 text-sm leading-relaxed text-tinta/70">{event.description}</p>}
                  <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-3"><dt className="text-[10px] font-black uppercase tracking-wider text-sol-600">Local exato</dt><dd className="mt-1 font-bold text-tinta">{event.location || "A confirmar pela Diretoria"}</dd></div>
                    <div className="rounded-xl bg-white p-3"><dt className="text-[10px] font-black uppercase tracking-wider text-sol-600">Concentração</dt><dd className="mt-1 font-bold text-tinta">{event.concentrationAt || "Horário a confirmar"}</dd></div>
                    <div className="rounded-xl bg-white p-3 sm:col-span-2"><dt className="text-[10px] font-black uppercase tracking-wider text-sol-600">Figurino / uniforme</dt><dd className="mt-1 font-bold text-tinta">{event.dressCode || "Orientação a confirmar com Mestre ou Diretoria"}</dd></div>
                  </dl>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => void confirmPresence(event.id, "going")} disabled={busy} aria-pressed={status === "going"} className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${status === "going" ? "bg-lago text-creme" : "bg-white text-lago ring-1 ring-lago/20 hover:bg-lago/10"}`}>
                      {busy ? "Salvando…" : "Vou comparecer"}
                    </button>
                    <button type="button" onClick={() => void confirmPresence(event.id, "unavailable")} disabled={busy} aria-pressed={status === "unavailable"} className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${status === "unavailable" ? "bg-sol text-creme" : "bg-white text-tinta/70 ring-1 ring-tinta/15 hover:bg-sol/10"}`}>
                      {busy ? "Salvando…" : "Não poderei ir"}
                    </button>
                    {status && <span className="text-xs font-bold text-tinta/60">{status === "going" ? "Presença confirmada" : "Ausência informada"}</span>}
                  </div>
                  {isAdmin && (() => {
                    const rows = rsvpSummary.filter((row) => row.eventId === event.id);
                    const going = rows.filter((row) => row.status === "going").reduce((sum, row) => sum + row.total, 0);
                    const unavailable = rows.filter((row) => row.status === "unavailable").reduce((sum, row) => sum + row.total, 0);
                    return (
                      <div className="mt-4 rounded-xl border border-lago/10 bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-black uppercase tracking-wider text-lago">Quórum por naipe</p>
                          <p className="text-xs font-extrabold text-tinta">{going} vão · {unavailable} não poderão ir</p>
                        </div>
                        {rows.length ? (
                          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                            {[...new Set(rows.map((row) => row.instrument || "Naipe não informado"))].sort((a, b) => a.localeCompare(b, "pt-BR")).map((name) => {
                              const byInstrument = rows.filter((row) => (row.instrument || "Naipe não informado") === name);
                              const yes = byInstrument.filter((row) => row.status === "going").reduce((sum, row) => sum + row.total, 0);
                              const no = byInstrument.filter((row) => row.status === "unavailable").reduce((sum, row) => sum + row.total, 0);
                              return <li key={name} className="flex justify-between gap-3 text-xs text-tinta/75"><span className="truncate">{name}</span><strong className="shrink-0">{yes} vão · {no} não</strong></li>;
                            })}
                          </ul>
                        ) : <p className="mt-2 text-xs text-tinta/55">Ainda não há respostas para este compromisso.</p>}
                      </div>
                    );
                  })()}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-areia p-6 text-sm font-semibold text-tinta/65">Não há compromissos futuros publicados para os integrantes neste momento. Quando a agenda operacional estiver disponível, os horários, locais, figurinos e confirmações aparecerão aqui.</div>
        )}
      </section>

      {/* Estudo */}
      <section className="space-y-5" aria-labelledby="study-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sol-600">Treino de casa</p>
            <h2 id="study-title" className="font-display mt-2 text-3xl text-lago sm:text-4xl">Estudo & repertório</h2>
            <p className="mt-2 max-w-2xl text-sm text-tinta/65">Áudios-guia e exercícios que o Mestre enviou para o seu ID, organizados para você estudar no seu tempo.</p>
          </div>
          <Link href="/inspiracoes#instrumentos" className="font-extrabold text-sol-600 underline underline-offset-4">Ouvir os naipes e instrumentos →</Link>
        </div>
        <PrivateAssignments />
      </section>

      {/* Diretório */}
      <MemberDirectory members={members} />
    </div>
  );
}
